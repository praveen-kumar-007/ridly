import axios from 'axios';
import { executeWithRotation } from './apiKeyManager';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Maximum Speed In-Memory Cache (Fallback)
const memoryCache = new Map();

// 24 hours in milliseconds
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; 

const setCache = (key, data) => {
    memoryCache.set(key, { data, timestamp: Date.now() });
    try {
        const cacheItem = { data, timestamp: Date.now() };
        localStorage.setItem(`ridly_api_${key}`, JSON.stringify(cacheItem));
    } catch (e) {
        // Silently ignore localStorage quota exceeded
    }
};

const getCache = (key) => {
    const now = Date.now();
    if (memoryCache.has(key)) {
        const item = memoryCache.get(key);
        if (now - item.timestamp < CACHE_EXPIRATION) return item.data;
        memoryCache.delete(key);
    }
    try {
        const storedStr = localStorage.getItem(`ridly_api_${key}`);
        if (storedStr) {
            const item = JSON.parse(storedStr);
            if (now - item.timestamp < CACHE_EXPIRATION) {
                memoryCache.set(key, item);
                return item.data;
            } else {
                localStorage.removeItem(`ridly_api_${key}`);
            }
        }
    } catch (e) {}
    return null;
};

const getCachedOrFetch = async (cacheKey, fetchCallback) => {
    if (!cacheKey) return await fetchCallback();
    
    const cachedData = getCache(cacheKey);
    if (cachedData) return cachedData;

    const data = await fetchCallback();
    // Cache if it's a valid tracks response or a string (video ID)
    if (data && ((data.tracks && data.tracks.length > 0) || typeof data === 'string')) {
        setCache(cacheKey, data);
    }
    return data;
};

// Normalizes YouTube API response to match the legacy Last.fm format expected by our UI
const normalizeYoutubeVideo = (item) => {
    return {
        name: item.snippet.title,
        artist: { name: item.snippet.channelTitle },
        image: [
            { '#text': item.snippet.thumbnails?.default?.url },
            { '#text': item.snippet.thumbnails?.medium?.url },
            { '#text': item.snippet.thumbnails?.high?.url },
            { '#text': item.snippet.thumbnails?.high?.url }
        ],
        youtubeId: item.id?.videoId || item.id,
        playcount: item.statistics?.viewCount || null
    };
};

export const getTopTracks = async (pageToken = '', limit = 30) => {
  const cacheKey = `topTracks_${pageToken}_${limit}`;
  return getCachedOrFetch(cacheKey, async () => {
      try {
        const response = await executeWithRotation(async (apiKey) => {
          return await axios.get(`${BASE_URL}/videos`, {
            params: {
              part: 'snippet,statistics',
              chart: 'mostPopular',
              regionCode: 'IN',
              videoCategoryId: '10', // Music
              maxResults: limit,
              key: apiKey,
              pageToken: pageToken
            },
          });
        });
        
        return {
            tracks: response.data.items.map(normalizeYoutubeVideo),
            nextPageToken: response.data.nextPageToken
        };
      } catch (error) {
        return { tracks: [], nextPageToken: null };
      }
  });
};

export const searchTracks = async (query, pageToken = '', limit = 30) => {
    // Only cache the initial loads (no pageToken) to ensure freshness of pagination but speed up initial vibe clicks
    const cacheKey = pageToken ? null : `search_${query}_${limit}`;
    
    const cachedData = cacheKey ? getCache(cacheKey) : null;
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await executeWithRotation(async (apiKey) => {
            return await axios.get(`${BASE_URL}/search`, {
                params: {
                    part: 'snippet',
                    q: `${query} official audio -shorts -short`,
                    type: 'video',
                    videoCategoryId: '10', // Music
                    maxResults: Math.min(limit * 2, 50), // Fetch more to shuffle well
                    key: apiKey,
                    pageToken: pageToken
                },
            });
        });
        
        let fetchedTracks = response.data.items.map(normalizeYoutubeVideo);
        
        for (let i = fetchedTracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [fetchedTracks[i], fetchedTracks[j]] = [fetchedTracks[j], fetchedTracks[i]];
        }
        
        if (fetchedTracks.length > limit) {
           fetchedTracks = fetchedTracks.slice(0, limit);
        }

        const result = {
            tracks: fetchedTracks,
            nextPageToken: response.data.nextPageToken
        };

        if (cacheKey && result.tracks.length > 0) {
            setCache(cacheKey, result);
        }

        return result;
    } catch (error) {
        return { tracks: [], nextPageToken: null };
    }
};

export const getYoutubeVideoId = async (trackName, artistName) => {
    const cacheKey = `videoId_${trackName}_${artistName}`;
    const cachedId = getCache(cacheKey);
    if (cachedId) return cachedId;

    try {
        const query = encodeURIComponent(`${trackName} ${artistName} official audio -shorts -short`);
        const response = await executeWithRotation(async (apiKey) => {
            return await axios.get(`${BASE_URL}/search?part=snippet&q=${query}&type=video&key=${apiKey}`);
        });
        if (response.data && response.data.items && response.data.items.length > 0) {
            const id = response.data.items[0].id.videoId;
            setCache(cacheKey, id);
            return id;
        }
        return null;
    } catch (error) {
        return null;
    }
};

export const getTopArtists = async () => [];
export const getTopTags = async () => [];
