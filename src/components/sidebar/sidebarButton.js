import React from 'react'
import { IconContext } from 'react-icons'
import { Link , useLocation} from 'react-router-dom'
import './sidebarButton.css'

export default function SidebarButton(props) {
  const location = useLocation()
  const isActive = location.pathname === props.to
  const btnClass = isActive ? 'btn-body active' : 'btn-body'

  return (
    <Link to={props.to}>
      <div className={btnClass}>
        <IconContext.Provider value={{size:"30px",className : "btn-icon"}}>
          {props.icon && <props.icon />}
        </IconContext.Provider>
      </div>
    </Link>
  )
}
