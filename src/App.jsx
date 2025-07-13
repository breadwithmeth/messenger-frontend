import './index.css';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Messenger from './pages/Messenger';
import Settings from './pages/Settings';
import Auth from './components/Auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('jwtToken'));

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!isAuthenticated ? (
        <Auth onLoginSuccess={handleLoginSuccess} />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/messenger" replace />} />
            <Route path="/messenger" element={<Messenger />} />
            <Route path="/settings/*" element={<Settings />} />
          </Routes>
        </BrowserRouter>
      )}
    </ThemeProvider>
  );
}