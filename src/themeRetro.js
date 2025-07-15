import { createTheme } from '@mui/material/styles';

// Создаем тему в стиле ретро-пиксель-арт
const retroTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF00FF', // Яркий пурпурный
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00FFFF', // Яркий циан
      contrastText: '#000000',
    },
    background: {
      default: '#000000',
      paper: '#1A1A1A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#AAAAAA',
    },
    error: {
      main: '#FF0000',
    },
    success: {
      main: '#00FF00',
    },
    divider: '#555555',
  },
  typography: {
    fontFamily: '"Press Start 2P", cursive', // Основной шрифт
    fontSize: 12,
    h1: { fontSize: '2.5rem' },
    h2: { fontSize: '2rem' },
    h3: { fontSize: '1.75rem' },
    h4: { fontSize: '1.5rem' },
    h5: { fontSize: '1.25rem' },
    h6: { fontSize: '1rem' },
    button: {
      fontFamily: '"Press Start 2P", cursive', // Шрифт для кнопок
      textTransform: 'uppercase',
      letterSpacing: '2px',
      fontSize: '0.75rem', // Немного уменьшим для кнопок
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          imageRendering: 'pixelated', // Четкие пиксели для изображений
          scrollbarColor: "#00FFFF #1A1A1A",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#000",
            width: '12px'
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 0,
            backgroundColor: "#FF00FF",
            border: "2px solid #00FFFF",
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#00FFFF",
            borderColor: '#FF00FF',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '2px solid',
          borderColor: 'currentColor',
          padding: '8px 16px',
          transition: 'all 0.1s linear',
          '&:hover': {
            backgroundColor: 'primary.main',
            color: 'background.default',
          },
        },
        containedPrimary: {
          backgroundColor: '#FF00FF',
          color: '#FFFFFF',
          borderColor: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#00FFFF',
            color: '#000000',
            borderColor: '#000000',
          },
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '2px solid #555555',
          boxShadow: '4px 4px 0px #00FFFF',
        },
      },
    },
    MuiDialog: {
        styleOverrides: {
            paper: {
                border: '2px solid #FF00FF',
                boxShadow: '6px 6px 0px #FF00FF',
            }
        }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            backgroundColor: '#000',
            '& fieldset': {
              borderWidth: '2px',
              borderColor: '#AAAAAA',
            },
            '&:hover fieldset': {
              borderColor: '#00FFFF',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FF00FF',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '2px solid transparent',
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 255, 0.2)',
            borderColor: '#00FFFF',
          },
        },
      },
    },
    MuiMenu: {
        styleOverrides: {
            paper: {
                border: '2px solid #AAAAAA',
                boxShadow: '4px 4px 0px #AAAAAA',
            }
        }
    },
    MuiListItem: {
        styleOverrides: {
            root: {
                borderRadius: 0,
                transition: 'background-color 0.1s linear',
                '&:hover': {
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                }
            }
        }
    },
    MuiTooltip: {
        styleOverrides: {
            tooltip: {
                borderRadius: 0,
                border: '2px solid #AAAAAA',
                backgroundColor: '#000000',
                color: '#FFFFFF',
                fontFamily: '"Press Start 2P", cursive',
                fontSize: '0.75rem',
                boxShadow: '4px 4px 0px #AAAAAA',
            }
        }
    }
  },
});

export default retroTheme;