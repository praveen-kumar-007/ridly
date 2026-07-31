import React from 'react';
import { useNavigate } from 'react-router-dom';
import './lib.css';

export default function Mixes() {
  const navigate = useNavigate();

  const imgParty = "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop";
  const imgChill = "https://images.unsplash.com/photo-1499946981954-e7f4b234d7fa?q=80&w=600&auto=format&fit=crop";
  const imgFocus = "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop";
  const imgDesi = "https://images.unsplash.com/photo-1533230554902-60293dbb7245?q=80&w=600&auto=format&fit=crop";
  const imgVintage = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop";
  const imgDark = "https://images.unsplash.com/photo-1488820098099-88092a95b871?q=80&w=600&auto=format&fit=crop";
  const imgPop = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop";
  const imgDevotional = "https://images.unsplash.com/photo-1604928141064-207cea6f5722?q=80&w=600&auto=format&fit=crop";
  const imgRock = "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop";

  const categories = [
    {
      title: "🔥 Daily Fresh Picks",
      moods: [
        { name: "Today's Releases", query: "2024 latest top new releases trending", image: imgPop },
        { name: "Trending Global", query: "trending top hits global 2024", image: imgParty },
        { name: "Trending India", query: "trending top hits india", image: imgDesi },
        { name: "Viral Sounds", query: "viral tiktok instagram reels songs", image: imgPop }
      ]
    },
    {
      title: "🇮🇳 Indian Regional (All Zones)",
      moods: [
        { name: "Bollywood Hits", query: "latest bollywood party hits 2024", image: imgParty },
        { name: "Punjabi Pop", query: "punjabi pop party hits sidhu moose wala diljit", image: imgDesi },
        { name: "Tamil Bangers", query: "tamil latest hit songs anirudh", image: imgParty },
        { name: "Telugu Top 50", query: "telugu latest top hits", image: imgDesi },
        { name: "New Bhojpuri", query: "new latest bhojpuri hits", image: imgDesi },
        { name: "Old Bhojpuri Classic", query: "old classic bhojpuri hits", image: imgVintage },
        { name: "V Bhojpuri", query: "bhojpuri item songs explicit dj mix", image: imgDark },
        { name: "Malayalam Hits", query: "malayalam super hit songs", image: imgDesi },
        { name: "Kannada Chartbusters", query: "kannada top hits songs", image: imgDesi },
        { name: "Bengali Classics", query: "bengali classic hit songs arijit", image: imgVintage },
        { name: "Marathi Mix", query: "marathi dj mix party songs", image: imgParty },
      ]
    },
    {
      title: "🙏 Devotional & Sufi",
      moods: [
        { name: "New Bhajans", query: "latest new hindi bhajan devotional", image: imgDevotional },
        { name: "Sufi Soul", query: "sufi hits nusrat rahat kailash kher", image: imgVintage },
        { name: "Morning Mantras", query: "morning mantra peace meditation", image: imgFocus },
        { name: "Qawwali", query: "best qawwali songs", image: imgVintage },
      ]
    },
    {
      title: "🎸 Global Genres",
      moods: [
        { name: "Hip-Hop / Rap", query: "top hip hop rap hits", image: imgDark },
        { name: "Pop Anthems", query: "top pop songs billboard", image: imgPop },
        { name: "R&B Classics", query: "r&b smooth hits", image: imgChill },
        { name: "Rock & Metal", query: "hard rock heavy metal hits", image: imgRock },
        { name: "EDM & Dance", query: "edm dance festival mix", image: imgParty },
        { name: "Indie & Alt", query: "indie alternative rock chill", image: imgChill },
        { name: "Classical", query: "classical symphony mozart beethoven", image: imgVintage },
        { name: "Jazz & Blues", query: "smooth jazz blues cafe", image: imgFocus },
        { name: "K-Pop", query: "kpop bts blackpink latest", image: imgParty },
      ]
    },
    {
      title: "👻 Thematic & Mood",
      moods: [
        { name: "Horror", query: "horror scary creepy ambient soundtrack", image: imgDark },
        { name: "Heartbreak", query: "sad heartbreak cry songs", image: imgChill },
        { name: "Workout Gym", query: "gym workout hardstyle bass boosted", image: imgRock },
        { name: "Late Night Drive", query: "midnight drive synthwave phonk", image: imgDark },
        { name: "Focus & Study", query: "hans zimmer interstellar focus lofi", image: imgFocus },
        { name: "Sleep & Calm", meditation: "deep sleep relaxation ambient", image: imgFocus },
      ]
    },
    {
      title: "🕰️ Decades (Throwbacks)",
      moods: [
        { name: "2010s Nostalgia", query: "2010s top hits nostalgia", image: imgParty },
        { name: "2000s Throwbacks", query: "2000s pop rnb hits", image: imgPop },
        { name: "90s Classics", query: "90s classic hits bollywood pop", image: imgVintage },
        { name: "80s Synth Pop", query: "80s synth pop disco hits", image: imgDark },
        { name: "70s Rock", query: "70s classic rock hits", image: imgRock },
      ]
    }
  ];

  const handleMoodClick = (query) => {
    navigate('/feed', { state: { moodQuery: query } });
  };

  return (
    <div className='screen-container resso-mixes-container'>
      <h1 className="mixes-title">Explore Universe</h1>
      
      <div className="mixes-scroll-area">
        {categories.map((category, catIdx) => (
          <div key={catIdx} className="category-section">
            <h2 className="category-title">{category.title}</h2>
            <div className="mixes-grid">
              {category.moods.map((mood, idx) => (
                <div 
                  key={idx} 
                  className="mix-card"
                  style={{ backgroundImage: `url(${mood.image})` }}
                  onClick={() => handleMoodClick(mood.query || mood.meditation)}
                >
                  <div className="mix-card-overlay"></div>
                  <h2>{mood.name}</h2>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

