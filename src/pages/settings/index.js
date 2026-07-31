import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import './settings.css';
import { FaKey, FaTrash, FaPlus, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import CryptoJS from 'crypto-js';

export default function Settings() {
  const [keys, setKeys] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const encryptionSecret = process.env.REACT_APP_ENCRYPTION_SECRET;

  const fetchKeys = async () => {
    try {
      setLoading(true);
      if (!db) {
        setError("Firebase is not initialized. Please check your .env file.");
        setLoading(false);
        return;
      }
      
      const querySnapshot = await getDocs(collection(db, 'ridly_youtubeApiKeys'));
      const fetchedKeys = [];
      querySnapshot.forEach((doc) => {
        fetchedKeys.push({ id: doc.id, label: doc.data().label || 'API Key' });
      });
      setKeys(fetchedKeys);
      setError('');
    } catch (err) {
      console.error(err);
      setError("Failed to fetch keys from Firebase. Check console and security rules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleAddKey = async (e) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    if (!encryptionSecret) {
      setError("REACT_APP_ENCRYPTION_SECRET is missing in .env. Cannot encrypt key.");
      return;
    }
    
    try {
      setLoading(true);
      // Encrypt the key before storing
      const encryptedKey = CryptoJS.AES.encrypt(newKey.trim(), encryptionSecret).toString();

      await addDoc(collection(db, 'ridly_youtubeApiKeys'), {
        key: encryptedKey,
        label: `Key ${keys.length + 1}`,
        createdAt: new Date()
      });
      setNewKey('');
      setSuccess("Key securely encrypted and added!");
      setTimeout(() => setSuccess(''), 3000);
      await fetchKeys();
    } catch (err) {
      console.error(err);
      setError("Failed to add key.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (id) => {
    if (!window.confirm("Are you sure you want to delete this key?")) return;
    
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'ridly_youtubeApiKeys', id));
      setSuccess("Key deleted successfully!");
      setTimeout(() => setSuccess(''), 3000);
      await fetchKeys();
    } catch (err) {
      console.error(err);
      setError("Failed to delete key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1><FaKey /> API Key Management</h1>
        <p>Manage your YouTube API keys. Keys are encrypted at rest.</p>
      </div>

      {!encryptionSecret && (
        <div className="settings-alert error">
          <FaExclamationTriangle /> 
          Critical: REACT_APP_ENCRYPTION_SECRET is missing in your .env file. You cannot save new keys.
        </div>
      )}

      {error && <div className="settings-alert error"><FaExclamationTriangle /> {error}</div>}
      {success && <div className="settings-alert success"><FaCheckCircle /> {success}</div>}

      <div className="settings-section glass-panel">
        <h2>Add New API Key</h2>
        <form className="add-key-form" onSubmit={handleAddKey}>
          <input 
            type="text" 
            placeholder="Enter YouTube API Key..." 
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            disabled={loading || !db || !encryptionSecret}
          />
          <button type="submit" disabled={loading || !newKey.trim() || !db || !encryptionSecret} className="primary-btn">
            <FaPlus /> Add Key
          </button>
        </form>
      </div>

      <div className="settings-section glass-panel">
        <h2>Active API Keys</h2>
        <div className="key-list">
          {loading && keys.length === 0 ? (
            <p className="loading-text">Loading keys from Firebase...</p>
          ) : (
            keys.map(k => (
              <div key={k.id} className="key-item">
                <div className="key-info">
                  <span className="key-label">{k.label}</span>
                  <span className="key-value">••••••••••••••••</span>
                </div>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDeleteKey(k.id)}
                  title="Delete Key"
                >
                  <FaTrash />
                </button>
              </div>
            ))
          )}
          
          {!loading && keys.length === 0 && (
            <p className="empty-text">No API keys found in Firebase. Please add one to use the app.</p>
          )}
        </div>
      </div>
    </div>
  );
}
