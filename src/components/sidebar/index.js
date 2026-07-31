import React from 'react';
import './sidebar.css';
import SidebarButton from './sidebarButton';
import { FaSearch, FaFire, FaHeart, FaMusic, FaCompactDisc, FaUser } from 'react-icons/fa';

export default function Sidebar() {
  return (
    <div className='sidebar-container'>
      <div className="bottom-nav-links">
        <SidebarButton title="Feed" to="/feed" icon={FaMusic} />
        <SidebarButton title="Trending" to="/trend" icon={FaFire} />
        <SidebarButton title="Mixes" to="/mixes" icon={FaCompactDisc} />
        <SidebarButton title="Search" to="/search" icon={FaSearch} />
        <SidebarButton title="Fav" to="/favorites" icon={FaHeart} />
      </div>
    </div>
  )
}
