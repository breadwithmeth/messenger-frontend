import './index.css';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Messenger from './pages/Messenger';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/messenger" replace />} />
          <Route path="/messenger" element={<Messenger />} />
          <Route path="/settings/*" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}