import { createTheme } from '@mui/material/styles';

/**
 * 编辑器界面主题：低饱和的淡蓝色调。
 * 注意：简历纸面（resume.css）独立使用黑灰，不受此主题影响。
 */
export const ui = {
  primary: '#3f6c9e',
  primaryDark: '#2f5580',
  primaryLight: '#7d9fc4',
  tint: '#e6eef7', // 选中 / 悬停底色
  tintStrong: '#d5e2f1',
  bg: '#f3f7fb', // 编辑区背景
  previewBg: '#e2e9f1', // 预览区背景
  previewBar: '#ebf0f6',
  border: 'rgba(48, 86, 128, 0.14)',
  muted: '#8a9db3',
} as const;

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: ui.primary, light: ui.primaryLight, dark: ui.primaryDark, contrastText: '#fff' },
    secondary: { main: '#6b8299', contrastText: '#fff' },
    error: { main: '#b5524e', contrastText: '#fff' },
    background: { default: ui.bg, paper: '#ffffff' },
    divider: ui.border,
    text: { primary: '#1f2b38', secondary: '#5d6d7e', disabled: '#a3b1c0' },
    action: { hover: 'rgba(63, 108, 158, 0.06)', selected: 'rgba(63, 108, 158, 0.12)' },
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
    MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { outlined: { borderColor: ui.border } } },
    MuiTooltip: { defaultProps: { arrow: true } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': { borderColor: ui.primaryLight },
        },
        notchedOutline: { borderColor: 'rgba(48, 86, 128, 0.22)' },
      },
    },
    MuiChip: {
      styleOverrides: {
        filled: {
          backgroundColor: ui.tint,
          color: ui.primaryDark,
          '&:hover': { backgroundColor: `${ui.tintStrong} !important` },
        },
        outlined: { borderColor: ui.border, color: '#5d6d7e' },
      },
    },
    MuiAccordion: {
      defaultProps: { disableGutters: true, elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${ui.border}`,
          borderRadius: 8,
          '&::before': { display: 'none' },
          '& + &': { marginTop: 8 },
          '&.Mui-expanded': { borderColor: ui.primaryLight },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderColor: 'rgba(48, 86, 128, 0.22)',
          '&.Mui-selected': { backgroundColor: ui.tint, color: ui.primaryDark },
          '&.Mui-selected:hover': { backgroundColor: ui.tintStrong },
        },
      },
    },
    MuiAppBar: { styleOverrides: { root: { borderColor: ui.border } } },
  },
});

export default theme;
