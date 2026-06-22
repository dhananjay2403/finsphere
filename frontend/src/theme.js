import { createTheme } from '@mui/material/styles';


// Warm neutral palette — burgundy primary, cream backgrounds, clay accents
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7A3E48',
      light: '#C88C96',
      dark: '#65323A',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#B07A61',
    },
    background: {
      default: '#F8F4EF',
      paper: '#FFFDFB',
    },
    text: {
      primary: '#1F1A17',
      secondary: '#6B6B6B',
    },
    success: {
      main: '#10b981',
    },
    error: {
      main: '#ef4444',
    },
    divider: '#E8DED5',
  },

  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: { fontWeight: 800, letterSpacing: '-0.035em' },
    h2: { fontWeight: 700, letterSpacing: '-0.025em' },
    h3: { fontWeight: 700, letterSpacing: '-0.025em' },
    h4: { fontWeight: 700, letterSpacing: '-0.025em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.6 },
    caption: { lineHeight: 1.5 },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },

  shape: {
    borderRadius: 8,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
          '&:active': { boxShadow: 'none' },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
          border: '1px solid #E8DED5',
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid #E8DED5',
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },

    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
  },
});


export default theme;
