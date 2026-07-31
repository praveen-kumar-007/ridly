import axios from 'axios';

const YOUTUBE_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Maximum Speed In-Memory Cache
const apiCache = new Map();

const getCachedOrFetch = async (cacheKey, fetchCallback) => {
    if (apiCache.has(cacheKey)) {
        return apiCache.get(cacheKey);
    }
    const data = await fetchCallback();
    if (data && data.tracks && data.tracks.length > 0) {
        apiCache.set(cacheKey, data);
    }
    return data;
};

// Normalizes YouTube API response to match the legacy Last.fm format expected by our UI
const normalizeYoutubeVideo = (item) => {
    return {
        name: item.snippet.title,
        artist: { name: item.snippet.channelTitle },
        image: [
            { '#text': item.snippet.thumbnails?.default?.url },
            { '#text': item.snippet.thumbnails?.medium?.url },
            { '#text': item.snippet.thumbnails?.high?.url },
            { '#text': item.snippet.thumbnails?.high?.url }
        ],
        youtubeId: item.id?.videoId || item.id,
        playcount: item.statistics?.viewCount || null
    };
};

export const getTopTracks = async (pageToken = '', limit = 30) => {
  const cacheKey = `topTracks_${pageToken}_${limit}`;
  return getCachedOrFetch(cacheKey, async () => {
      try {
        const response = await axios.get(`${BASE_URL}/videos`, {
          params: {
            part: 'snippet,statistics',
            chart: 'mostPopular',
            regionCode: 'IN',
            videoCategoryId: '10', // Music
            maxResults: limit,
            key: YOUTUBE_KEY,
            pageToken: pageToken
          },
        });
        
        return {
            tracks: response.data.items.map(normalizeYoutubeVideo),
            nextPageToken: response.data.nextPageToken
        };
      } catch (error) {
        console.error('Error fetching top tracks from YouTube:', error);
        return { tracks: [], nextPageToken: null };
      }
  });
};

export const searchTracks = async (query, pageToken = '', limit = 30) => {
    // Only cache the initial loads (no pageToken) to ensure freshness of pagination but speed up initial vibe clicks
    const cacheKey = pageToken ? null : `search_${query}_${limit}`;
    
    if (cacheKey && apiCache.has(cacheKey)) {
        return apiCache.get(cacheKey);
    }

    try {
        const response = await axios.get(`${BASE_URL}/search`, {
            params: {
                part: 'snippet',
                q: `${query} official audio`,
                type: 'video',
                videoCategoryId: '10', // Music
                maxResults: Math.min(limit * 2, 50), // Fetch more to shuffle well
                key: YOUTUBE_KEY,
                pageToken: pageToken
            },
        });
        
        let fetchedTracks = response.data.items.map(normalizeYoutubeVideo);
        
        for (let i = fetchedTracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [fetchedTracks[i], fetchedTracks[j]] = [fetchedTracks[j], fetchedTracks[i]];
        }
        
        if (fetchedTracks.length > limit) {
           fetchedTracks = fetchedTracks.slice(0, limit);
        }

        const result = {
            tracks: fetchedTracks,
            nextPageToken: response.data.nextPageToken
        };

        if (cacheKey && result.tracks.length > 0) {
            apiCache.set(cacheKey, result);
        }

        return result;
    } catch (error) {
        console.error('Error searching tracks from YouTube:', error);
        return { tracks: [], nextPageToken: null };
    }
};

export const getYoutubeVideoId = async (trackName, artistName) => {
    const cacheKey = `videoId_${trackName}_${artistName}`;
    if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

    try {
        const query = encodeURIComponent(`${trackName} ${artistName} official audio`);
        const response = await axios.get(`${BASE_URL}/search?part=snippet&q=${query}&type=video&key=${YOUTUBE_KEY}`);
        if (response.data && response.data.items && response.data.items.length > 0) {
            const id = response.data.items[0].id.videoId;
            apiCache.set(cacheKey, id);
            return id;
        }
        return null;
    } catch (error) {
        console.error('Error fetching YouTube video:', error);
        return null;
    }
};

export const getTopArtists = async () => [];
export const getTopTags = async () => [];
