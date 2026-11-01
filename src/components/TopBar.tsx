import { useRef, useState, type RefObject } from 'react';
import {
  AppBar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
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
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckIcon from '@mui/icons-material/Check';
import { useResume } from '../store';
import { LOCALES, useI18n } from '../i18n';
import { normalize } from '../utils/storage';
import { SaveTooltip, useDocActions } from './DocActions';

const exporter = () => import('../utils/exporter');

const pad = (n: number) => String(n).padStart(2, '0');

/** 窄屏只显示图标，宽屏显示图标 + 文字 */
const Label = ({ children }: { children: string }) => (
  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
    {children}
  </Box>
);
const btnSx = { whiteSpace: 'nowrap', flexShrink: 0, minWidth: 0, '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } } };

export default function TopBar({
  resumeRef,
  onOpenStyle,
}: {
  resumeRef: RefObject<HTMLDivElement | null>;
  onOpenStyle: () => void;
}) {
  const { data, update, savedAt, isSaved } = useResume();
  const { t, locale } = useI18n();
  const actions = useDocActions();
  const [langEl, setLangEl] = useState<HTMLElement | null>(null);
  const [exportEl, setExportEl] = useState<HTMLElement | null>(null);
  const [moreEl, setMoreEl] = useState<HTMLElement | null>(null);
  const [busy, setBusy] = useState(false);
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
      actions.toast(t('export.failed', { msg: (e as Error).message }));
    } finally {
      setBusy(false);
    }
  };

  const onImport = async (file?: File) => {
    if (!file) return;
    try {
      const d = normalize(JSON.parse(await file.text()));
      if (!d) throw new Error(t('data.badFormat'));
      delete d.pristine;
      actions.replaceGuarded(d);
    } catch (e) {
      actions.toast(t('data.importFailed', { msg: (e as Error).message }));
    }
  };

  const closeMore = (fn: () => void) => () => {
    setMoreEl(null);
    fn();
  };

  return (
    <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar variant="dense" sx={{ gap: { xs: 0.5, sm: 1 }, minHeight: 56, px: { xs: 1.5, sm: 2 } }}>
        <Box
          component="img"
          src={`${import.meta.env.BASE_URL}favicon.svg`}
          alt=""
          sx={{ width: 26, height: 26, display: { xs: 'none', md: 'block' } }}
        />
        <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: 0.5, display: { xs: 'none', md: 'block' } }}>
          EasyCV
        </Typography>
        <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.5, display: { xs: 'none', md: 'block' } }} />
        <InputBase
          value={data.docTitle}
          onChange={(e) =>
            update((d) => {
              d.docTitle = e.target.value;
            })
          }
          placeholder={t('app.docTitlePlaceholder')}
          sx={{ fontWeight: 600, flex: '1 1 260px', maxWidth: 300, minWidth: 60, '& input': { textOverflow: 'ellipsis' } }}
        />
        <Box sx={{ flex: 1 }} />
        {savedAt && (
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', lg: 'block' }, mr: 1 }}>
            {t('app.savedAt', { time: `${pad(savedAt.getHours())}:${pad(savedAt.getMinutes())}:${pad(savedAt.getSeconds())}` })}
          </Typography>
        )}

        <Tooltip title={t('lib.title')}>
          <Button size="small" color="inherit" startIcon={<FolderOpenOutlinedIcon />} onClick={actions.openLibrary} sx={btnSx}>
            <Label>{t('lib.button')}</Label>
          </Button>
        </Tooltip>
        <SaveTooltip>
          <IconButton size="small" onClick={() => actions.save()} aria-label={t('lib.save')}>
            <Badge color="primary" variant="dot" invisible={isSaved}>
              <SaveOutlinedIcon fontSize="small" />
            </Badge>
          </IconButton>
        </SaveTooltip>
        <Tooltip title={t('app.language')}>
          <IconButton size="small" onClick={(e) => setLangEl(e.currentTarget)} aria-label={t('app.language')}>
            <TranslateIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Button variant="outlined" size="small" startIcon={<PaletteOutlinedIcon />} onClick={onOpenStyle} sx={btnSx} aria-label={t('app.style')}>
          <Label>{t('app.style')}</Label>
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
          <IconButton size="small" onClick={(e) => setMoreEl(e.currentTarget)} sx={{ ml: -0.5 }}>
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>

      {/* 界面语言 */}
      <Menu anchorEl={langEl} open={!!langEl} onClose={() => setLangEl(null)}>
        {LOCALES.map((l) => (
          <MenuItem
            key={l.id}
            selected={l.id === locale}
            onClick={() => {
              setLangEl(null);
              actions.switchLocale(l.id);
            }}
          >
            <ListItemIcon>{l.id === locale && <CheckIcon fontSize="small" />}</ListItemIcon>
            <ListItemText primary={l.label} slotProps={{ primary: { lang: l.htmlLang } }} />
          </MenuItem>
        ))}
      </Menu>

      {/* 导出 */}
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
        <Divider />
        <MenuItem
          onClick={() => {
            setExportEl(null);
            exporter().then((m) => m.downloadJson(data, filename));
          }}
        >
          <ListItemIcon>
            <FileDownloadOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('data.backup')} />
        </MenuItem>
      </Menu>

      {/* 更多：样例数据 / 新建 / 导入导出 JSON */}
      <Menu anchorEl={moreEl} open={!!moreEl} onClose={() => setMoreEl(null)}>
        <MenuItem onClick={closeMore(actions.openLibrary)}>
          <ListItemIcon>
            <FolderOpenOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('lib.title')} />
        </MenuItem>
        <MenuItem onClick={closeMore(actions.newEmpty)}>
          <ListItemIcon>
            <NoteAddOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('data.newEmpty')} />
        </MenuItem>
        <Divider />
        <ListSubheader sx={{ lineHeight: '32px' }}>{t('lib.samples')}</ListSubheader>
        {LOCALES.map((l) => (
          <MenuItem key={l.id} onClick={closeMore(() => actions.loadSample(l.id))}>
            <ListItemIcon>
              <ArticleOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={l.label} slotProps={{ primary: { lang: l.htmlLang } }} />
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={closeMore(() => exporter().then((m) => m.downloadJson(data, filename)))}>
          <ListItemIcon>
            <FileDownloadOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('data.backup')} />
        </MenuItem>
        <MenuItem onClick={closeMore(() => fileRef.current?.click())}>
          <ListItemIcon>
            <FileUploadOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('data.import')} />
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
    </AppBar>
  );
}
