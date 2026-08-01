import React from 'react';
import { IconContext } from 'react-icons';
import { Link, useLocation } from 'react-router-dom';
import './sidebarButton.css';

export default function SidebarButton(props) {
  const location = useLocation();
  const isActive = location.pathname === props.to;
  const btnClass = isActive ? 'btn-body active' : 'btn-body';

  return (
    <Link to={props.to} style={{ textDecoration: 'none' }}>
      <div className={btnClass}>
        <IconContext.Provider value={{ size: "22px", className: "btn-icon" }}>
          {props.icon && <props.icon />}
          <p className="mobile-btn-label">{props.title}</p>
          <span className="btn-title">{props.title}</span>
        </IconContext.Provider>
      </div>
    </Link>
  );
}
