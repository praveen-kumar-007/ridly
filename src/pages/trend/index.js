import React, { useState, useEffect } from 'react';
import { getTopTracks } from '../../api';
import RessoPlayer from '../../components/ressoPlayer';

export default function Trend() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageToken, setPageToken] = useState('');
  const [isFetchingPage, setIsFetchingPage] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      const data = await getTopTracks('', 15);
      if (data && data.tracks) {
        setTracks(data.tracks);
        setPageToken(data.nextPageToken);
      }
      setLoading(false);
    };

    fetchTrending();
  }, []);

  const loadMore = () => {
    if (loading || isFetchingPage || !pageToken) return;
    setIsFetchingPage(true);
    getTopTracks(pageToken, 15).then(data => {
      if (data && data.tracks) {
        setTracks(prev => [...prev, ...data.tracks]);
        setPageToken(data.nextPageToken);
      }
      setIsFetchingPage(false);
    });
  };

  if (loading && tracks.length === 0) {
    return <div className="loader">Loading Trending India...</div>;
  }

  return (
    <RessoPlayer tracks={tracks} onLoadMore={loadMore} />
  );
}
