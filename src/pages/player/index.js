import React, { useContext } from 'react';
import { PlayerContext } from '../../context/PlayerContext';
import RessoPlayer from '../../components/ressoPlayer';

export default function Player() {
  const { queue } = useContext(PlayerContext);
  
  if (!queue || queue.length === 0) {
    return <div className="loader">Play some music to start your vibe!</div>;
  }
  
  return (
    <RessoPlayer tracks={queue} />
  );
}
