import React from 'react'
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function ProtectedRoutes({children}) {
  const { authUser, loading } = useUser();
  const location = useLocation();
  if (loading) return null
  // const isAuth = JSON.parse(localStorage.getItem("isAuth") || false)  ;
  // return isAuth ? children : <Navigate to="/login"/>
  if(!authUser){
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children;
}
