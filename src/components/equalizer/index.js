import React from 'react';
import './equalizer.css';

export default function Equalizer({ isPlaying }) {
  if (!isPlaying) return null;

  return (
    <div className="resso-equalizer">
      <div className="bar bar1"></div>
      <div className="bar bar2"></div>
      <div className="bar bar3"></div>
      <div className="bar bar4"></div>
    </div>
  );
}
