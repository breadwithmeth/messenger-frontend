import { createTheme } from '@mui/material/styles';

const appleTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF', // Apple's primary blue
      light: '#40A4FF',
      dark: '#0056CC',
    },
    secondary: {
      main: '#5856D6', // Apple's purple
      light: '#7B79DC',
      dark: '#4340B8',
    },
    background: {
      default: '#F8F8F8', // Более светлый фон
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1C1E',
      secondary: '#8E8E93', // Более светлый серый
      disabled: '#C7C7CC',
    },
    divider: 'rgba(60, 60, 67, 0.05)', // Еще более тонкие разделители
    success: {
      main: '#30D158', // Apple's green
      light: '#5DE67E',
      dark: '#28B946',
    },
    error: {
      main: '#FF453A', // Apple's red
      light: '#FF6B63',
      dark: '#D70015',
    },
    info: {
      main: '#007AFF',
      light: '#40A4FF',
      dark: '#0056CC',
    },
    warning: {
      main: '#FF9F0A', // Apple's orange
      light: '#FFB340',
      dark: '#FF8C00',
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
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '-0.01em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '-0.01em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.33,
      letterSpacing: '0em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-0.5px)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.25)',
            transform: 'translateY(-0.5px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: 'none',
          },
        },
        outlined: {
          borderWidth: 1,
          borderColor: 'rgba(0, 122, 255, 0.2)',
          '&:hover': {
            borderColor: '#007AFF',
            backgroundColor: 'rgba(0, 122, 255, 0.03)',
            borderWidth: 1,
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(0, 122, 255, 0.03)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 20,
            backgroundColor: '#F8F8F8',
            border: 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              border: 'none',
            },
            '&:hover': {
              backgroundColor: '#F2F2F2',
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 0 1px rgba(0, 122, 255, 0.3)',
            },
          },
          '& .MuiInputLabel-outlined': {
            color: '#8E8E93',
            '&.Mui-focused': {
              color: '#007AFF',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: 'none',
          border: '1px solid rgba(0, 0, 0, 0.03)',
          '&.MuiCard-root': {
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          },
        },
        elevation1: {
          boxShadow: '0 1px 6px rgba(0, 0, 0, 0.04)',
        },
        elevation2: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          margin: '1px 8px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(0, 122, 255, 0.03)',
            transform: 'translateX(2px)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          margin: '1px 8px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(0, 122, 255, 0.03)',
            transform: 'translateX(2px)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 122, 255, 0.06)',
            '&:hover': {
              backgroundColor: 'rgba(0, 122, 255, 0.08)',
            },
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          marginTop: 8,
        },
        list: {
          padding: 8,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 0',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(0, 122, 255, 0.04)',
            transform: 'translateX(2px)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.02)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '24px 24px 16px',
          fontSize: '1.25rem',
          fontWeight: 600,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '0 24px 16px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px',
          gap: 12,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(0, 122, 255, 0.04)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiSnackbarContent-root': {
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          },
        },
      },
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
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }
        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        *::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          border: none;
        }
        *::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.3);
        }
        body {
          font-feature-settings: 'kern' 1, 'liga' 1;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        ::selection {
          background-color: rgba(0, 122, 255, 0.2);
        }
      `,
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
});

export default appleTheme;
