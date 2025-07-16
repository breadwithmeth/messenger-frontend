import React from 'react';
import { Box, Typography, Button, Alert, Paper } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px'
          }}
        >
          <Paper
            sx={{
              p: 4,
              maxWidth: 500,
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }}>
              <Typography variant="h6" gutterBottom>
                Что-то пошло не так
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Произошла неожиданная ошибка. Попробуйте перезагрузить страницу или обратитесь к администратору.
              </Typography>
            </Alert>
            
            {this.props.showDetails && this.state.error && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Детали ошибки:
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'monospace',
                    backgroundColor: '#F5F5F5',
                    p: 2,
                    borderRadius: 2,
                    fontSize: '0.875rem',
                    color: 'text.secondary'
                  }}
                >
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)',
                  }
                }}
              >
                Перезагрузить страницу
              </Button>
              <Button 
                variant="outlined"
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                }}
              >
                Попробовать снова
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
