import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import AppTheme from './AppTheme.jsx';
import { UserProvider } from './context/UserContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppTheme>
        <UserProvider>
          <App />
        </UserProvider>
      </AppTheme>
    </BrowserRouter>
  </StrictMode>,
)
