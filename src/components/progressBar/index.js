import React, { useContext, useRef } from 'react';
import { PlayerContext } from '../../context/PlayerContext';
import './progressBar.css';

export default function ProgressBar({ track }) {
  const { currentTrack, progress, currentTime, duration, formatTime, seek } = useContext(PlayerContext);
  const progressBarRef = useRef();

  // Only show progress if this track is the one currently loaded in the player
  const isThisTrack = currentTrack && currentTrack.youtubeId === track.youtubeId;

  const handleSeek = (e) => {
    if (!isThisTrack) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    seek(percentage);
  };

  if (!isThisTrack) {
     return <div className="resso-progress-placeholder"></div>;
  }

  return (
    <div className="resso-progress-container">
      <span className="time-text">{formatTime(currentTime)}</span>
      <div className="progress-bar-bg" ref={progressBarRef} onClick={handleSeek}>
        <div className="progress-bar-fill" style={{ width: `${progress}%` }}>
            <div className="progress-bar-thumb"></div>
        </div>
      </div>
      <span className="time-text">{formatTime(duration)}</span>
    </div>
  );
}
