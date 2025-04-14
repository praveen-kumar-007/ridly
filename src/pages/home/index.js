import React from 'react'
import Lib from '../lib/index'
import Player from '../player/index'
import Trend from '../trend/index'
import Feed from '../feed/index'
import Fav from '../fav/index'
import './home.css'
import Sidebar from '../../components/sidebar'

import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Login from '../auth/login'

export default function Home() {
  return (
    
    <Router> 
      <div className='main-body'>
        <Login/>
        <Sidebar/>
          <Routes>
            <Route path="/" element={<Lib/>} />
              <Route path="/fav" element={<Fav/>} />
              <Route path="/feed" element={<Feed/>} />
              <Route path="/player" element={<Player/>} />
              <Route path="/trend" element={<Trend/>} />
        </Routes>
      </div>
  </Router>
    
  )
}
