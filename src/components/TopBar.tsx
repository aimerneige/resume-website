import { useRef, useState, type RefObject } from 'react';
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputBase,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import { useResume } from '../store';
import { emptyData } from '../defaults';
import { sampleData } from '../samples';
import { LOCALES, useI18n } from '../i18n';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckIcon from '@mui/icons-material/Check';
import { normalize } from '../utils/storage';

const exporter = () => import('../utils/exporter');

const pad = (n: number) => String(n).padStart(2, '0');

export default function TopBar({
  resumeRef,
  onOpenStyle,
}: {
  resumeRef: RefObject<HTMLDivElement | null>;
  onOpenStyle: () => void;
}) {
  const { data, update, replace, savedAt } = useResume();
  const { t, locale, setLocale } = useI18n();
  const [langEl, setLangEl] = useState<HTMLElement | null>(null);
  const [exportEl, setExportEl] = useState<HTMLElement | null>(null);
  const [moreEl, setMoreEl] = useState<HTMLElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [confirm, setConfirm] = useState<null | 'sample' | 'empty'>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filename = `${data.basic.name || t('app.defaultFileName')}${data.basic.title ? '-' + data.basic.title : ''}`;

  const run = async (fn: (node: HTMLElement) => Promise<void> | void) => {
    setExportEl(null);
    const node = resumeRef.current;
    if (!node) return;
    setBusy(true);
    try {
      await fn(node);
    } catch (e) {
      console.error(e);
      setToast(t('export.failed', { msg: (e as Error).message }));
    } finally {
      setBusy(false);
    }
  };

  const onImport = async (file?: File) => {
    if (!file) return;
    try {
      const d = normalize(JSON.parse(await file.text()));
      if (!d) throw new Error(t('data.badFormat'));
      replace(d);
      setToast(t('data.imported'));
    } catch (e) {
      setToast(t('data.importFailed', { msg: (e as Error).message }));
    }
  };

  return (
    <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar variant="dense" sx={{ gap: 1, minHeight: 56 }}>
        <Box
          component="img"
          src={`${import.meta.env.BASE_URL}favicon.svg`}
          alt=""
          sx={{ width: 26, height: 26, display: { xs: 'none', sm: 'block' } }}
        />
        <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: 0.5, display: { xs: 'none', sm: 'block' } }}>
          EasyCV
        </Typography>
        <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.5, display: { xs: 'none', sm: 'block' } }} />
        <InputBase
          value={data.docTitle}
          onChange={(e) =>
            update((d) => {
              d.docTitle = e.target.value;
            })
          }
          placeholder={t('app.docTitlePlaceholder')}
          sx={{ fontWeight: 600, flex: '0 1 260px', minWidth: 80, '& input': { textOverflow: 'ellipsis' } }}
        />
        <Box sx={{ flex: 1 }} />
        {savedAt && (
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, mr: 1 }}>
            {t('app.savedAt', { time: `${pad(savedAt.getHours())}:${pad(savedAt.getMinutes())}:${pad(savedAt.getSeconds())}` })}
          </Typography>
        )}
        <Tooltip title={t('app.language')}>
          <IconButton size="small" onClick={(e) => setLangEl(e.currentTarget)} aria-label={t('app.language')}>
            <TranslateIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Button variant="outlined" size="small" startIcon={<PaletteOutlinedIcon />} onClick={onOpenStyle} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            {t('app.style')}
          </Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
            {t('app.styleShort')}
          </Box>
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon />}
          disabled={busy}
          sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          onClick={(e) => setExportEl(e.currentTarget)}
        >
          {t('app.export')}
        </Button>
        <Tooltip title={t('app.more')}>
          <IconButton size="small" onClick={(e) => setMoreEl(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>

      <Menu anchorEl={langEl} open={!!langEl} onClose={() => setLangEl(null)}>
        {LOCALES.map((l) => (
          <MenuItem
            key={l.id}
            selected={l.id === locale}
            onClick={() => {
              setLocale(l.id);
              setLangEl(null);
            }}
          >
            <ListItemIcon>{l.id === locale && <CheckIcon fontSize="small" />}</ListItemIcon>
            <ListItemText primary={l.label} slotProps={{ primary: { lang: l.htmlLang } }} />
          </MenuItem>
        ))}
      </Menu>

      <Menu anchorEl={exportEl} open={!!exportEl} onClose={() => setExportEl(null)}>
        <MenuItem onClick={() => run(async (n) => (await exporter()).exportPdf(n, data.style.padY, filename))}>
          <ListItemIcon>
            <PictureAsPdfOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('export.pdf')} secondary={t('export.pdfHint')} />
        </MenuItem>
        <MenuItem onClick={() => run(async () => (await exporter()).printResume(data.style.padY))}>
          <ListItemIcon>
            <PrintOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('export.print')} secondary={t('export.printHint')} />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => run(async (n) => (await exporter()).exportImage(n, 'png', filename))}>
          <ListItemIcon>
            <ImageOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('export.png')} secondary={t('export.pngHint')} />
        </MenuItem>
        <MenuItem onClick={() => run(async (n) => (await exporter()).exportImage(n, 'jpeg', filename))}>
          <ListItemIcon>
            <ImageOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('export.jpg')} secondary={t('export.jpgHint')} />
        </MenuItem>
      </Menu>

      <Menu anchorEl={moreEl} open={!!moreEl} onClose={() => setMoreEl(null)}>
        <MenuItem
          onClick={() => {
            setMoreEl(null);
            exporter().then((m) => m.downloadJson(data, filename));
          }}
        >
          <ListItemIcon>
            <FileDownloadOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('data.backup')} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMoreEl(null);
            fileRef.current?.click();
          }}
        >
          <ListItemIcon>
            <FileUploadOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('data.import')} />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setMoreEl(null);
            setConfirm('sample');
          }}
        >
          <ListItemIcon>
            <RestartAltIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('data.loadSample')} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMoreEl(null);
            setConfirm('empty');
          }}
        >
          <ListItemIcon>
            <NoteAddOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('data.newEmpty')} />
        </MenuItem>
      </Menu>
      <input
        ref={fileRef}
        hidden
        type="file"
        accept="application/json,.json"
        onChange={(e) => {
          onImport(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <Dialog open={!!confirm} onClose={() => setConfirm(null)}>
        <DialogTitle>{confirm === 'sample' ? t('data.confirmSample') : t('data.confirmEmpty')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t('data.confirmBody')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setConfirm(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              replace(confirm === 'sample' ? sampleData(locale) : emptyData(locale, t));
              setConfirm(null);
            }}
          >
            {t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </AppBar>
  );
}
