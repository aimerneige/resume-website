import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';
import { ResumeProvider } from './store';
import App from './App';
import { FontsProvider } from './fonts/FontsProvider';
// 界面字体：思源黑体（SIL OFL 1.1），自托管
import '@fontsource/noto-sans-sc/400.css';
import '@fontsource/noto-sans-sc/700.css';
import './global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FontsProvider>
        <ResumeProvider>
          <App />
        </ResumeProvider>
      </FontsProvider>
    </ThemeProvider>
  </StrictMode>,
);
