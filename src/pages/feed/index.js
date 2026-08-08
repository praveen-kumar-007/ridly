import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { searchTracks } from '../../api';
import RessoPlayer from '../../components/ressoPlayer';

export default function Feed() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageToken, setPageToken] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchRecommendations = async (token = '', queryOverride = null) => {
      let targetQuery = queryOverride || location.state?.moodQuery || searchQuery;
      
      if (!targetQuery) {
          try {
              const storedUser = localStorage.getItem('ridly_user');
              let historyKey = 'ridly_play_history';
              if (storedUser) {
                const user = JSON.parse(storedUser);
                historyKey = `ridly_play_history_${user.email}`;
              }
              
              const historyStr = localStorage.getItem(historyKey) || '[]';
              const history = JSON.parse(historyStr);
              if (history.length > 0) {
                  const counts = history.reduce((acc, artist) => {
                      acc[artist] = (acc[artist] || 0) + 1;
                      return acc;
                  }, {});
                  const sortedArtists = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
                  const topArtists = sortedArtists.slice(0, 3).join(" ");
                  targetQuery = `${topArtists} latest new songs 2024`;
              }
          } catch (err) {
              console.error("Failed to load user preferences", err);
              targetQuery = "2024 latest top new releases trending";
          }
          setSearchQuery(targetQuery);
      }
  
      const data = await searchTracks(targetQuery, token, 15);
      
      // PRELOAD IMAGES AGGRESSIVELY FOR ZERO-DELAY RENDERING
      data.tracks.forEach(track => {
          const imgUrl = track.image ? track.image[track.image.length - 1]['#text'] : null;
          if (imgUrl) {
              const img = new Image();
              img.src = imgUrl;
          }
      });

      if (!token) {
        setTracks(data.tracks);
      } else {
        setTracks(prev => [...prev, ...data.tracks]);
      }
      setPageToken(data.nextPageToken);
      setLoading(false);
    };

    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.moodQuery]);

  const loadMore = () => {
    if (loading || isFetchingPage || !pageToken) return;
    setIsFetchingPage(true);
    searchTracks(searchQuery, pageToken, 15).then(data => {
      if (data && data.tracks) {
        setTracks(prev => [...prev, ...data.tracks]);
        setPageToken(data.nextPageToken);
      }
      setIsFetchingPage(false);
    });
  };

  if (loading && tracks.length === 0) {
    return <div className="loader">Building your Vibe...</div>;
  }

  return (
    <RessoPlayer tracks={tracks} onLoadMore={loadMore} />
  );
}
