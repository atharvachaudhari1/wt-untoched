import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#E91E63', light: '#F48FB1', dark: '#C2185B', contrastText: '#fff' },
    secondary: { main: '#7C4DFF', light: '#B47CFF', dark: '#3F1DCB' },
    success: { main: '#4CAF50' },
    warning: { main: '#FF9800' },
    error: { main: '#F44336' },
    info: { main: '#2196F3' },
    background: { default: '#FFF0F5', paper: '#FFFFFF' },
    text: { primary: '#1A1A2E', secondary: '#5C5C7B' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, padding: '8px 20px', boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(233,30,99,0.3)' } },
        containedPrimary: { background: 'linear-gradient(135deg, #E91E63, #C2185B)' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(233,30,99,0.08)' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: '0 1px 8px rgba(0,0,0,0.08)' },
      },
    },
  },
});

export default theme;
