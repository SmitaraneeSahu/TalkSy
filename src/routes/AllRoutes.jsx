import React from 'react'
import {Route, Routes} from 'react-router-dom';
import ProtectedRoutes from './ProtectedRoutes';
import HomePage from '../pages/HomePage';
import Login from '../pages/Login';
import CreatePost from '../pages/CreatePost';
import PageNotFound from '../pages/PageNotFound';
import Search from '../pages/Search';
import User from '../pages/User';
import ProfilePage from '../pages/ProfilePage';

export default function AllRoutes() {
  return (
    <main>
        <Routes>
            <Route path='/' element={<ProtectedRoutes><HomePage/></ProtectedRoutes>}/>
            <Route path='post' element={<ProtectedRoutes><CreatePost/></ProtectedRoutes>}/>
            <Route path='login' element={<Login/>}/>
            <Route path='search' element={<ProtectedRoutes><Search/></ProtectedRoutes>}/>
            <Route path='user' element={<ProtectedRoutes><User/></ProtectedRoutes>}/>
            <Route path="/profile/:id" element={<ProtectedRoutes><ProfilePage /></ProtectedRoutes>} />
            <Route path='*' element={<PageNotFound/>}/>
        </Routes>
    </main>
  )
}
