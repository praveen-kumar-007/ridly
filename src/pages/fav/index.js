import React from 'react';
import { useFavorites } from '../../hooks/useFavorites';
import RessoPlayer from '../../components/ressoPlayer';

export default function Fav() {
  const { favorites } = useFavorites();
  if (favorites.length === 0) {
    return <div className="loader">Your library is empty. Go like some songs!</div>;
  }

  return (
    <RessoPlayer tracks={favorites} />
  );
}
