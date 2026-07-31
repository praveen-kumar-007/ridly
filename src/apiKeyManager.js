import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import CryptoJS from 'crypto-js';

let keysCache = [];
try {
  const stored = localStorage.getItem('ridly_cached_keys');
  if (stored) keysCache = JSON.parse(stored);
} catch(e) {}

let currentKeyIndex = 0;
let isFetchingKeys = false;
let fetchKeysPromise = null;
let hasSynced = false;

export const loadApiKeys = async () => {
  if (keysCache.length > 0) {
    if (!hasSynced) {
      hasSynced = true;
      syncApiKeysBackground(); 
    }
    return keysCache;
  }
  
  if (isFetchingKeys && fetchKeysPromise) return fetchKeysPromise;
  return await syncApiKeysBackground();
};

const syncApiKeysBackground = () => {
  isFetchingKeys = true;
  fetchKeysPromise = new Promise(async (resolve) => {
    try {
      if (db) {
        const querySnapshot = await getDocs(collection(db, 'ridly_youtubeApiKeys'));
        const fetchedKeys = [];
        const encryptionSecret = process.env.REACT_APP_ENCRYPTION_SECRET;
        
        querySnapshot.forEach((doc) => {
          const encryptedKey = doc.data().key;
          if (encryptedKey) {
             try {
                if (encryptionSecret) {
                  const bytes = CryptoJS.AES.decrypt(encryptedKey, encryptionSecret);
                  const originalKey = bytes.toString(CryptoJS.enc.Utf8);
                  if (originalKey) {
                    fetchedKeys.push(originalKey);
                  }
                }
             } catch (e) {}
          }
        });
        if (fetchedKeys.length > 0) {
          keysCache = fetchedKeys;
          try {
            localStorage.setItem('ridly_cached_keys', JSON.stringify(fetchedKeys));
          } catch(e) {}
        }
      } 
    } catch (error) {}
    
    isFetchingKeys = false;
    hasSynced = true;
    resolve(keysCache);
  });
  
  return fetchKeysPromise;
};

export const getNextKey = () => {
  if (keysCache.length === 0) return null;
  currentKeyIndex = (currentKeyIndex + 1) % keysCache.length;
  return keysCache[currentKeyIndex];
};

export const getCurrentKey = async () => {
    await loadApiKeys();
    if (keysCache.length === 0) return null;
    return keysCache[currentKeyIndex];
};

/**
 * Wraps an API call and automatically retries with a new key if a 403 occurs.
 */
export const executeWithRotation = async (requestFn, maxRetries = null) => {
  await loadApiKeys();
  const maxAttempts = maxRetries !== null ? maxRetries : Math.max(1, keysCache.length);
  
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const key = await getCurrentKey();
    if (!key) {
      throw new Error("No YouTube API Key available");
    }
    
    try {
      return await requestFn(key);
    } catch (error) {
      // YouTube returns 403 for quota limits
      if (error.response && error.response.status === 403) {
        getNextKey();
        attempts++;
      } else {
        // If it's a 400 or other error, don't rotate, just throw
        throw error;
      }
    }
  }
  
  throw new Error("All API keys have exceeded their quota or failed.");
};
