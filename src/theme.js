import { createTheme } from '@mui/material/styles';

// Swiss Style Design System
const swissTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000', // Pure black - Swiss style foundation
      light: '#333333',
      dark: '#000000',
    },
    secondary: {
      main: '#FF0000', // Bold red accent - typical Swiss style
      light: '#FF3333',
      dark: '#CC0000',
    },
    background: {
      default: '#FFFFFF', // Pure white background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000', // High contrast black text
      secondary: '#666666', // Medium gray for secondary text
      disabled: '#CCCCCC',
    },
    divider: '#E0E0E0', // Clean gray dividers
    success: {
      main: '#00AA00', // Clean green
      light: '#33BB33',
      dark: '#008800',
    },
    error: {
      main: '#FF0000', // Bold red
      light: '#FF3333',
      dark: '#CC0000',
    },
    info: {
      main: '#0066CC', // Professional blue
      light: '#3388DD',
      dark: '#004499',
    },
    warning: {
      main: '#FF8800', // Orange warning
      light: '#FFAA33',
      dark: '#CC6600',
    }
  },
  typography: {
    fontFamily: [
      'Helvetica Neue', // Swiss style primary font
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    // Swiss style typography hierarchy - улучшенная читаемость
    h1: {
      fontSize: '3rem',
      fontWeight: 300, // Light weight for Swiss style
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 300,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 400,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 400,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      letterSpacing: 0,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
      letterSpacing: 0,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem', // 16px - оптимальный размер для чтения
      fontWeight: 400,
      lineHeight: 1.6, // Увеличено для лучшей читаемости
      letterSpacing: '0.01em', // Слегка увеличено
    },
    body2: {
      fontSize: '0.9rem', // Увеличено с 0.875rem для лучшей читаемости
      fontWeight: 400,
      lineHeight: 1.5, // Увеличено
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.8rem', // Увеличено с 0.75rem
      fontWeight: 400,
      lineHeight: 1.4, // Увеличено
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
    },
    button: {
      fontSize: '0.875rem', // Добавлен размер для кнопок
      fontWeight: 500,
      letterSpacing: '0.05em', // Увеличено для лучшей читаемости uppercase текста
      textTransform: 'uppercase',
      lineHeight: 1.4,
    },
    // Добавляем специальные варианты для интерфейса
    subtitle1: {
      fontSize: '1.1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontSize: '0.95rem',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.01em',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Swiss style: no rounded corners
          textTransform: 'uppercase',
          fontWeight: 500,
          letterSpacing: '0.08em',
          padding: '12px 24px',
          border: '2px solid transparent',
          '&:hover': {
            transform: 'none', // No elevation effects in Swiss style
          },
        },
        contained: {
          backgroundColor: '#000000',
          color: '#FFFFFF',
          border: '2px solid #000000',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#FFFFFF',
            color: '#000000',
            border: '2px solid #000000',
            boxShadow: 'none',
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: '#000000',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#000000',
            color: '#FFFFFF',
            borderColor: '#000000',
          },
        },
        text: {
          color: '#000000',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            transition: 'none', // Убираем анимации для производительности
            '& fieldset': {
              border: '2px solid #E0E0E0',
              transition: 'none', // Убираем анимации
            },
            '&:hover fieldset': {
              borderColor: '#BDBDBD',
              transition: 'none', // Убираем анимации
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2196F3',
              transition: 'none', // Убираем анимации
            },
          },
          '& .MuiInputBase-input': {
            transition: 'none', // Убираем анимации с input
            fontSize: '16px', // Предотвращаем zoom на мобильных
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Swiss style: rectangular shapes
          boxShadow: 'none',
          border: '1px solid #E0E0E0',
          '&.MuiCard-root': {
            border: '2px solid #000000',
          },
        },
        elevation1: {
          boxShadow: 'none',
          border: '1px solid #E0E0E0',
        },
        elevation2: {
          boxShadow: 'none',
          border: '2px solid #000000',
        },
        elevation3: {
          boxShadow: 'none',
          border: '2px solid #000000',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Swiss style: no rounded corners
          border: '2px solid #000000',
          boxShadow: 'none',
          transition: 'none', // No animations in Swiss style
          '&:hover': {
            transform: 'none',
            boxShadow: 'none',
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
          borderRadius: 0,
          margin: 0,
          borderBottom: '1px solid #E0E0E0',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            backgroundColor: '#F8F8F8',
            transform: 'none',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          margin: 0,
          borderBottom: '1px solid #E0E0E0',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            backgroundColor: '#F8F8F8',
            transform: 'none',
          },
          '&.Mui-selected': {
            backgroundColor: '#000000',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#333333',
            },
            '& .MuiListItemIcon-root': {
              color: '#FFFFFF',
            },
            '& .MuiListItemText-primary': {
              color: '#FFFFFF',
            },
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 0, // Swiss style: rectangular shapes
          boxShadow: 'none',
          border: '2px solid #000000',
          marginTop: 0,
        },
        list: {
          padding: 0,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Swiss style: rectangular
          margin: 0,
          padding: '12px 16px',
          borderBottom: '1px solid #E0E0E0',
          transition: 'none',
          '&:hover': {
            backgroundColor: '#F0F0F0',
            transform: 'none',
          },
          '&:last-child': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: '3px solid #000000',
          boxShadow: 'none',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '24px',
          fontSize: '1.25rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          borderBottom: '2px solid #E0E0E0',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '24px',
          borderTop: '2px solid #E0E0E0',
          gap: 16,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Swiss style: rectangular buttons
          transition: 'none',
          '&:hover': {
            backgroundColor: '#F0F0F0',
            transform: 'none',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Swiss style: rectangular chips
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          border: '1px solid #000000',
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiSnackbarContent-root': {
            borderRadius: 0, // Swiss style: rectangular
            boxShadow: 'none',
            border: '2px solid #000000',
          },
        },
      },
    },
    MuiDialog: {
        styleOverrides: {
            paper: {
                borderRadius: 0, // Swiss style: rectangular dialogs
                border: '3px solid #000000',
                boxShadow: 'none',
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
    borderRadius: 0, // Swiss style: no rounded corners
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

export default swissTheme;
