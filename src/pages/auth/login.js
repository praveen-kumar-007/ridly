import React from 'react'
import {loginEndpoint} from '../../spotify'
import './login.css'

export default function Login() {
  return (
      <div className='login-page'>
          {/* <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSHWIruwWtn-ZvGoSzKnymZvcCeH_mojF5pQ&s' alt='spotify logo' className='logo' /> */}
          <a href={loginEndpoint}><div className='login-btn'>Log IN</div></a>
      
    </div>
  )
}



