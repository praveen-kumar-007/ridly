import React, { useContext } from 'react';
import { PlayerContext } from '../../context/PlayerContext';
import { FaPlay, FaPause, FaStepBackward, FaStepForward } from 'react-icons/fa';
import './globalPlayer.css';

export default function GlobalPlayer() {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    progress, 
    seek, 
    nextTrack, 
    prevTrack 
  } = useContext(PlayerContext);

  if (!currentTrack) return null;

  const handleSeek = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    seek(percentage);
  };

  const imageUrl = currentTrack.image ? currentTrack.image[1]['#text'] : '';

  return (
    <div className="global-player glass-panel">
      <div className="gp-info">
        {imageUrl ? (
            <img src={imageUrl} alt="art" className="gp-art" />
        ) : (
            <div className="gp-art-placeholder"></div>
        )}
        <div className="gp-text">
            <div className="gp-title">{currentTrack.name}</div>
            <div className="gp-artist">{currentTrack.artist.name}</div>
        </div>
      </div>
      
      <div className="gp-controls-container">
        <div className="gp-controls">
            <button className="gp-btn" onClick={prevTrack}><FaStepBackward /></button>
            <button className="gp-btn gp-play-btn" onClick={togglePlay}>
                {isPlaying ? <FaPause /> : <FaPlay style={{marginLeft: '2px'}}/>}
            </button>
            <button className="gp-btn" onClick={nextTrack}><FaStepForward /></button>
        </div>
        <div className="gp-progress-bg" onClick={handleSeek}>
            <div className="gp-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="gp-extra">
        {/* Future volume controls can go here */}
      </div>
    </div>
  );
}
