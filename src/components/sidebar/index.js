import React from 'react'
import './sidebar.css'
import SidebarButton from './sidebarButton'
import { AiFillApple, AiFillFileExclamation } from "react-icons/ai";
import { AiFillGoogleSquare } from "react-icons/ai";
import { AiFillHome } from "react-icons/ai";
import { AiFillGithub } from "react-icons/ai";
import { BsFillArrowDownLeftCircleFill } from 'react-icons/bs';

export default function Sidebar() {
  return (
    <div className='sidebar-container'>
      <img src='https://cdn.pixabay.com/photo/2021/09/20/03/24/skeleton-6639547_1280.png' alt='profile img' className='profile-img' />
      <div>
        <SidebarButton title="Feed" to="./feed" icon={AiFillApple} />
        <SidebarButton title="Trending" to="/trending" icon={AiFillGithub} />
        <SidebarButton title="Player" to="/player" icon={AiFillGoogleSquare} />
        <SidebarButton title="Fav" to="/fav" icon={AiFillHome} />
        <SidebarButton title="Lib" to="/" icon={BsFillArrowDownLeftCircleFill} />
      </div>
      <SidebarButton title="Sign Out" to="" icon={AiFillFileExclamation} />
    </div>
  )
}
