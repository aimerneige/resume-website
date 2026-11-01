import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';
import { ResumeProvider } from './store';
import App from './App';
import './global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ResumeProvider>
        <App />
      </ResumeProvider>
    </ThemeProvider>
  </StrictMode>,
);
