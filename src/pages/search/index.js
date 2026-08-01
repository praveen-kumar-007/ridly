import React, { useState } from 'react';
import { searchTracks } from '../../api';
import { FaSearch } from 'react-icons/fa';
import RessoPlayer from '../../components/ressoPlayer';
import './search.css';

export default function Search() {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageToken, setPageToken] = useState('');
  const [isFetchingPage, setIsFetchingPage] = useState(false);

  const handleSearch = async (e, token = '') => {
    if (e) e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    const data = await searchTracks(query, token, 15);
      if (!token) {
        setTracks(data.tracks);
      } else {
        setTracks(prev => [...prev, ...data.tracks]);
      }
      setPageToken(data.nextPageToken);
      setLoading(false);
  };

  const loadMore = () => {
    if (loading || isFetchingPage || !pageToken || !query) return;
    setIsFetchingPage(true);
    searchTracks(query, pageToken, 15).then(data => {
        if (data && data.tracks) {
          setTracks(prev => [...prev, ...data.tracks]);
          setPageToken(data.nextPageToken);
        }
        setIsFetchingPage(false);
    });
  };



  return (
    <div className='playlists-container'>
      <div className="search-bar-container">
        <form onSubmit={handleSearch} className="search-form">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search for songs, artists..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
        </form>
      </div>

      {loading && tracks.length === 0 ? (
        <div className="loader">Searching...</div>
      ) : tracks.length > 0 ? (
        <div style={{height: 'calc(100% - 80px)'}}>
          <RessoPlayer tracks={tracks} onLoadMore={loadMore} />
        </div>
      ) : (
        <div className="loader">Search for any song to start your Vibe!</div>
      )}
    </div>
  );
}
