import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { FaListUl, FaArrowLeft } from 'react-icons/fa';
import RessoPlayer from '../../components/ressoPlayer';
import './playlists.css';

export default function Playlists() {
  const [playlists, setPlaylists] = useState({});
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const user = JSON.parse(localStorage.getItem('ridly_user') || '{}');
  const userEmail = user.email || 'guest@ridly.app';

  useEffect(() => {
    if (!userEmail) return;
    const playlistRef = doc(db, 'users', userEmail, 'userData', 'playlists');
    
    const unsubscribe = onSnapshot(playlistRef, (docSnap) => {
      if (docSnap.exists()) {
        setPlaylists(docSnap.data());
      } else {
        setPlaylists({});
      }
    });

    return () => unsubscribe();
  }, [userEmail]);

  if (selectedPlaylist) {
    const tracks = playlists[selectedPlaylist] || [];
    
    return (
      <div className="playlists-container" style={{padding: 0, position: 'relative'}}>
        <div style={{position: 'absolute', top: 20, left: 20, zIndex: 100}}>
          <button className="back-btn" onClick={() => setSelectedPlaylist(null)} style={{background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '50%', color: 'white', border: 'none', cursor: 'pointer'}}>
            <FaArrowLeft size={20} />
          </button>
        </div>
        
        {tracks.length === 0 ? (
          <div className="loader">This playlist is empty.</div>
        ) : (
          <RessoPlayer tracks={tracks} />
        )}
      </div>
    );
  }

  return (
    <div className="playlists-container">
      <h1 className="page-title">Your Playlists</h1>
      
      {Object.keys(playlists).length === 0 ? (
        <div className="loader">You haven't created any playlists yet.</div>
      ) : (
        <div className="playlists-grid">
          {Object.keys(playlists).map((name) => (
            <div className="playlist-card" key={name} onClick={() => setSelectedPlaylist(name)}>
              <div className="playlist-card-icon">
                <FaListUl color="white" />
              </div>
              <div className="playlist-card-info">
                <h3>{name}</h3>
                <p>{playlists[name].length} tracks</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
