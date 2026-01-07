import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import Logo from '../assets/vector-chat-icon.png'

export default function Header() {
  return (
    <header className='header'>
        <Link to="/" className='logo'>
            <img  src={Logo} alt='logo'/>
            <span className='heading'>TalkSy</span>
        </Link>
        <nav className='nav'>
            <NavLink to="/" className="Link">
                <i className='bi bi-house' style={{ fontSize: '1.5rem' }}></i>
            </NavLink>
            <NavLink to="/search" className="Link">
                <i className='bi bi-search' style={{ fontSize: '1.5rem' }}></i>
            </NavLink>
            <NavLink to="/post" className="Link">
                <i className='bi bi-plus-circle' style={{ fontSize: '1.5rem' }}></i>
            </NavLink>
            <NavLink to="/user" className="Link">
                <i className='bi bi-person-circle' style={{ fontSize: '1.5rem' }}></i>
            </NavLink>
        </nav>
    </header>
  )
}
