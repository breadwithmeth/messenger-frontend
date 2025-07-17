import React, { createContext, useState, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children, anchorOrigin = { vertical: 'bottom', horizontal: 'center' } }) {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info', // 'error', 'warning', 'info', 'success'
  });

  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ open: false });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
      >
        <Alert 
          onClose={handleClose} 
          severity={notification.severity} 
          sx={{ 
            width: '100%',
            borderRadius: 0, // Swiss style: no rounded corners
            fontFamily: '"Helvetica Neue", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '0.8rem',
            border: '2px solid',
            borderColor: notification.severity === 'error' ? '#FF0000' : 
                        notification.severity === 'warning' ? '#FF0000' : 
                        notification.severity === 'success' ? '#000000' : '#000000',
            backgroundColor: notification.severity === 'error' ? '#FFFFFF' : 
                           notification.severity === 'warning' ? '#FFFFFF' : 
                           notification.severity === 'success' ? '#000000' : '#FFFFFF',
            color: notification.severity === 'error' ? '#FF0000' : 
                  notification.severity === 'warning' ? '#FF0000' : 
                  notification.severity === 'success' ? '#FFFFFF' : '#000000',
            '& .MuiAlert-icon': {
              color: 'inherit'
            }
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}
