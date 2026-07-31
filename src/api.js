import axios from 'axios';

const YOUTUBE_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

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
};

export const searchTracks = async (query, pageToken = '', limit = 30) => {
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
        
        // Fisher-Yates shuffle to guarantee completely random results every time they open a vibe
        for (let i = fetchedTracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [fetchedTracks[i], fetchedTracks[j]] = [fetchedTracks[j], fetchedTracks[i]];
        }
        
        // If we fetched extra to get good entropy, slice it down to the requested limit
        if (fetchedTracks.length > limit) {
           fetchedTracks = fetchedTracks.slice(0, limit);
        }

        return {
            tracks: fetchedTracks,
            nextPageToken: response.data.nextPageToken
        };
    } catch (error) {
        console.error('Error searching tracks from YouTube:', error);
        return { tracks: [], nextPageToken: null };
    }
};

// We don't need this anymore since every track already has youtubeId,
// but keeping it as a fallback just in case some rogue track slips in.
export const getYoutubeVideoId = async (trackName, artistName) => {
    try {
        const query = encodeURIComponent(`${trackName} ${artistName} official audio`);
        const response = await axios.get(`${BASE_URL}/search?part=snippet&q=${query}&type=video&key=${YOUTUBE_KEY}`);
        if (response.data && response.data.items && response.data.items.length > 0) {
            return response.data.items[0].id.videoId;
        }
        return null;
    } catch (error) {
        console.error('Error fetching YouTube video:', error);
        return null;
    }
};

export const getTopArtists = async () => {
    // Stubbed for now since YouTube doesn't have an exact equivalent to Last.fm artists endpoint
    return [];
};

export const getTopTags = async () => {
    return [];
};
