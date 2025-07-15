import './index.css';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Messenger from './pages/Messenger';
import Settings from './pages/Settings';
import Auth from './components/Auth';
import { Box } from '@mui/material';
import LandingPage from './pages/LandingPage'; // Импортируем лендинг

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('jwtToken'));

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/messenger" />} />
          <Route path="/login" element={!isAuthenticated ? <Auth onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/messenger" />} />
          
          {isAuthenticated && (
            <>
              <Route path="/messenger" element={<Messenger onLogout={handleLogout} />} />
              <Route path="/settings/*" element={<Settings onLogout={handleLogout} />} />
            </>
          )}
          
          <Route path="*" element={<Navigate to={isAuthenticated ? "/messenger" : "/"} />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}