import { createTheme } from '@mui/material/styles';

const appleTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF', // Apple's primary blue
    },
    secondary: {
      main: '#5856D6', // Apple's purple
    },
    background: {
      default: '#F2F2F7', // Light gray background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#6E6E73',
    },
    divider: '#D1D1D6',
    success: {
        main: '#34C759', // Apple's green
    },
    error: {
        main: '#FF3B30', // Apple's red
    },
    info: {
        main: '#007AFF',
    },
    warning: {
        main: '#FF9500', // Apple's orange
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h6: {
      fontWeight: 600,
    },
     button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 20,
             backgroundColor: '#EFEFF4',
             border: 'none',
             '& fieldset': {
                border: 'none',
             }
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
           boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        },
      },
    },
     MuiMenu: {
      styleOverrides: {
        paper: {
            borderRadius: 8,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        }
      }
    },
    MuiDialog: {
        styleOverrides: {
            paper: {
                borderRadius: 14,
            }
        }
    },
    MuiCssBaseline: {
      styleOverrides: `
        * {
          scrollbar-width: thin;
          scrollbar-color: #A8A8A8 #F2F2F7;
        }
        *::-webkit-scrollbar {
          width: 8px;
        }
        *::-webkit-scrollbar-track {
          background: #F2F2F7;
        }
        *::-webkit-scrollbar-thumb {
          background-color: #A8A8A8;
          border-radius: 10px;
          border: 2px solid #F2F2F7;
        }
      `,
    },
  },
});

export default appleTheme;
