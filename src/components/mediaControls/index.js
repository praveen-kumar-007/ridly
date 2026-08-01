import React, { useContext } from 'react';
import { PlayerContext } from '../../context/PlayerContext';
import { FaStepBackward, FaStepForward, FaRandom, FaRedoAlt, FaPlay, FaPause } from 'react-icons/fa';
import './mediaControls.css';

export default function MediaControls({ track, onPlay }) {
  const { currentTrack, nextTrack, prevTrack, isShuffle, toggleShuffle, isRepeat, toggleRepeat, togglePlay, isPlaying } = useContext(PlayerContext);
  
  const isActive = currentTrack && (currentTrack.youtubeId === track?.youtubeId || currentTrack.name === track?.name);

  const handlePlayPause = (e) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay();
    } else {
      togglePlay();
    }
  };

  return (
    <div className={`media-controls-overlay ${isActive ? 'active' : ''}`}>
      <div className="control-btn" onClick={(e) => { e.stopPropagation(); toggleShuffle(); }} title="Shuffle">
        <FaRandom color={isShuffle ? '#ff0055' : 'rgba(255,255,255,0.7)'} size={15} />
      </div>
      
      <div className="control-btn skip-btn" onClick={(e) => { e.stopPropagation(); prevTrack(); }} title="Previous">
        <FaStepBackward color="white" size={17} />
      </div>
      
      {/* Play/Pause Button */}
      <div className="control-btn play-pause-btn" onClick={handlePlayPause} title={isPlaying ? "Pause" : "Play"}>
        {isActive && isPlaying ? (
          <FaPause color="#121212" size={20} />
        ) : (
          <FaPlay color="#121212" size={20} style={{ marginLeft: '3px' }} />
        )}
      </div>
      
      <div className="control-btn skip-btn" onClick={(e) => { e.stopPropagation(); nextTrack(); }} title="Next">
        <FaStepForward color="white" size={17} />
      </div>
      
      <div className="control-btn" onClick={(e) => { e.stopPropagation(); toggleRepeat(); }} title="Repeat">
        <FaRedoAlt color={isRepeat ? '#ff0055' : 'rgba(255,255,255,0.7)'} size={15} />
      </div>
    </div>
  );
}
