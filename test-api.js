const axios = require('axios');
const API_KEY = 'c39453bfc0328cb4bcb94c83b34c82a8';

async function test() {
  try {
    const res = await axios.get('https://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'chart.gettoptracks',
        api_key: API_KEY,
        format: 'json',
        limit: 5
      }
    });
    console.log("SUCCESS! Got data:", res.data.tracks ? "Yes, tracks array length " + res.data.tracks.track.length : "No");
  } catch (err) {
    console.error("ERROR:", err.response ? err.response.data : err.message);
  }
}

test();
