import { useState, useEffect } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('music_favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch(e) {
        console.error('Failed to parse favorites', e);
      }
    }
  }, []);

  const saveFavorites = (newFavorites) => {
    setFavorites(newFavorites);
    localStorage.setItem('music_favorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (trackName) => {
    return favorites.some(t => t.name === trackName);
  };

  const toggleFavorite = (track) => {
    if (isFavorite(track.name)) {
      saveFavorites(favorites.filter(t => t.name !== track.name));
    } else {
      saveFavorites([...favorites, track]);
    }
  };

  return { favorites, isFavorite, toggleFavorite };
};
