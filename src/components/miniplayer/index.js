import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlayerContext } from '../../context/PlayerContext';
import { FaPlay, FaPause, FaStepForward } from 'react-icons/fa';
import './miniplayer.css';

export default function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlay, nextTrack, progress } = useContext(PlayerContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show MiniPlayer if we are already on the full Player page or if no track is loaded
  if (!currentTrack || location.pathname === '/player') {
    return null;
  }

  const imageUrl = currentTrack.image ? (currentTrack.image[1]['#text'] || currentTrack.image[0]['#text']) : '';
  const artistName = typeof currentTrack.artist === 'string' ? currentTrack.artist : currentTrack.artist?.name;

  return (
    <div className="mini-player-container" onClick={() => navigate('/player')}>
      <div className="mini-progress-bar" style={{ width: `${progress}%` }}></div>
      <img src={imageUrl} alt={currentTrack.name} className="mini-player-img" />
      
      <div className="mini-player-info">
        <h4>{currentTrack.name}</h4>
        <p>{artistName}</p>
      </div>

      <div className="mini-player-controls" onClick={e => e.stopPropagation()}>
        <button className="mini-control-btn mini-play-btn" onClick={togglePlay}>
          {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
        </button>
        <button className="mini-control-btn" onClick={nextTrack}>
          <FaStepForward size={20} />
        </button>
      </div>
    </div>
  );
}
