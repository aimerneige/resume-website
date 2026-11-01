import { StrictMode, useEffect, useMemo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { UI_FONT, makeTheme } from './theme';
import { ResumeProvider } from './store';
import App from './App';
import { FontsProvider } from './fonts/FontsProvider';
import { loadBuiltinFont } from './fonts/registry';
import { I18nProvider, useI18n } from './i18n';
import { DocActionsProvider } from './components/DocActions';
// 默认界面字体：思源黑体（SIL OFL 1.1），自托管；其他语言的界面字体按需加载
import '@fontsource/noto-sans-sc/400.css';
import '@fontsource/noto-sans-sc/700.css';
import './global.css';
import { migrateLegacyStorage } from './utils/storageKeys';

migrateLegacyStorage();

function LocalizedTheme({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const theme = useMemo(() => makeTheme(locale), [locale]);
  useEffect(() => {
    loadBuiltinFont(UI_FONT[locale].fontId);
  }, [locale]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <LocalizedTheme>
        <FontsProvider>
          <ResumeProvider>
            <DocActionsProvider>
              <App />
            </DocActionsProvider>
          </ResumeProvider>
        </FontsProvider>
      </LocalizedTheme>
    </I18nProvider>
  </StrictMode>,
);
