import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className=''>
         <p>© 2030 <Link to="/" style={{color: '#475569'}}>Talksy</Link>. All Rights Reserved.</p>
    </footer>
  )
}
