import { createTheme } from '@mui/material/styles';

const ink = '#1f1f1f';
const gray = { main: '#616161', light: '#9e9e9e', dark: '#424242', contrastText: '#fff' };

/** 全黑灰配色的 Material 主题 */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: ink, light: '#484848', dark: '#000', contrastText: '#fff' },
    secondary: gray,
    error: { main: '#424242', contrastText: '#fff' },
    warning: gray,
    info: gray,
    success: gray,
    background: { default: '#f4f4f4', paper: '#ffffff' },
    divider: 'rgba(0,0,0,0.1)',
    text: { primary: '#1f1f1f', secondary: '#666' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily:
      'Inter, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", "Noto Sans CJK SC", system-ui, sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 700 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiTooltip: { defaultProps: { arrow: true } },
    MuiAccordion: {
      defaultProps: { disableGutters: true, elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid rgba(0,0,0,0.12)',
          borderRadius: 8,
          '&::before': { display: 'none' },
          '& + &': { marginTop: 8 },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: { root: { textTransform: 'none', '&.Mui-selected': { background: '#e0e0e0' } } },
    },
  },
});

export default theme;
