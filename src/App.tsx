import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, Fab, useMediaQuery, useTheme } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useResume } from './store';
import TopBar from './components/TopBar';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import StyleDrawer from './components/StyleDrawer';
import Resume from './components/Resume';
import { useI18n } from './i18n';

export default function App() {
  const { data } = useResume();
  const { t } = useI18n();
  const resumeRef = useRef<HTMLDivElement>(null);
  const [styleOpen, setStyleOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('md'));

  const showEdit = wide || mobileView === 'edit';
  const showPreview = wide || mobileView === 'preview';

  return (
    <>
      <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <TopBar resumeRef={resumeRef} onOpenStyle={() => setStyleOpen(true)} />
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
          <Box
            sx={{
              flex: { md: '1 1 50%' },
              width: { xs: '100%', md: 'auto' },
              minWidth: 0,
              display: showEdit ? 'block' : 'none',
              borderRight: { md: '1px solid' },
              borderColor: { md: 'divider' },
            }}
          >
            <EditorPanel />
          </Box>
          {/* 预览区在移动端也保持挂载，保证导出时能拿到节点 */}
          <Box
            sx={{
              flex: { md: '1 1 50%' },
              width: { xs: '100%', md: 'auto' },
              minWidth: 0,
              ...(showPreview ? {} : { position: 'absolute', left: -10000, top: 0, width: 900, height: 10 }),
            }}
          >
            <PreviewPanel resumeRef={resumeRef} />
          </Box>
        </Box>
      </Box>

      {!wide && (
        <Fab
          color="primary"
          variant="extended"
          onClick={() => setMobileView((v) => (v === 'edit' ? 'preview' : 'edit'))}
          sx={{ position: 'fixed', right: 20, bottom: 20 }}
        >
          {mobileView === 'edit' ? <VisibilityOutlinedIcon sx={{ mr: 1 }} /> : <EditOutlinedIcon sx={{ mr: 1 }} />}
          {mobileView === 'edit' ? t('app.preview') : t('app.edit')}
        </Fab>
      )}

      <StyleDrawer open={styleOpen} onClose={() => setStyleOpen(false)} />

      {/* 打印专用副本：屏幕上隐藏，打印时只输出它 */}
      {createPortal(
        <div id="print-root">
          <Resume data={data} />
        </div>,
        document.body,
      )}
    </>
  );
}
