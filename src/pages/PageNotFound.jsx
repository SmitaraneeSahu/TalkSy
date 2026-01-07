import React from 'react'
import Logo from '../assets/pageNotFound.png';
import useTitle from '../hooks/useTitle';

export default function PageNotFound() {
  useTitle('PageNotFound');
  return (
    <div className='pnf-img' style={{display: 'flex', justifySelf: 'center', alignItems:'center',height: '90vh'}}>
      <img src={Logo} alt="pageNotFound" style={{height:'200px', width: '400px',}}/>
    </div>
  )
}
