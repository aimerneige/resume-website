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
import { emptyData, sampleData } from '../defaults';
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
  const [exportEl, setExportEl] = useState<HTMLElement | null>(null);
  const [moreEl, setMoreEl] = useState<HTMLElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [confirm, setConfirm] = useState<null | 'sample' | 'empty'>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filename = `${data.basic.name || '简历'}${data.basic.title ? '-' + data.basic.title : ''}`;

  const run = async (fn: (node: HTMLElement) => Promise<void> | void) => {
    setExportEl(null);
    const node = resumeRef.current;
    if (!node) return;
    setBusy(true);
    try {
      await fn(node);
    } catch (e) {
      console.error(e);
      setToast('导出失败：' + (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onImport = async (file?: File) => {
    if (!file) return;
    try {
      const d = normalize(JSON.parse(await file.text()));
      if (!d) throw new Error('文件格式不正确');
      replace(d);
      setToast('已导入简历数据');
    } catch (e) {
      setToast('导入失败：' + (e as Error).message);
    }
  };

  return (
    <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar variant="dense" sx={{ gap: 1, minHeight: 56 }}>
        <Box
          component="img"
          src="/favicon.svg"
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
          placeholder="简历名称"
          sx={{ fontWeight: 600, flex: '0 1 260px', minWidth: 80, '& input': { textOverflow: 'ellipsis' } }}
        />
        <Box sx={{ flex: 1 }} />
        {savedAt && (
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, mr: 1 }}>
            已自动保存 {pad(savedAt.getHours())}:{pad(savedAt.getMinutes())}:{pad(savedAt.getSeconds())}
          </Typography>
        )}
        <Button variant="outlined" size="small" startIcon={<PaletteOutlinedIcon />} onClick={onOpenStyle} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            模板与样式
          </Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
            样式
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
          导出
        </Button>
        <Tooltip title="更多">
          <IconButton size="small" onClick={(e) => setMoreEl(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>

      <Menu anchorEl={exportEl} open={!!exportEl} onClose={() => setExportEl(null)}>
        <MenuItem onClick={() => run(async (n) => (await exporter()).exportPdf(n, data.style.padY, filename))}>
          <ListItemIcon>
            <PictureAsPdfOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="下载 PDF" secondary="与预览完全一致，自动分页" />
        </MenuItem>
        <MenuItem onClick={() => run(async () => (await exporter()).printResume(data.style.padY))}>
          <ListItemIcon>
            <PrintOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="打印 / 矢量 PDF" secondary="浏览器打印，文字可选中，适合投递" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => run(async (n) => (await exporter()).exportImage(n, 'png', filename))}>
          <ListItemIcon>
            <ImageOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="下载 PNG 图片" secondary="长图，清晰无损" />
        </MenuItem>
        <MenuItem onClick={() => run(async (n) => (await exporter()).exportImage(n, 'jpeg', filename))}>
          <ListItemIcon>
            <ImageOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="下载 JPG 图片" secondary="体积更小" />
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
          <ListItemText primary="备份数据（JSON）" />
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
          <ListItemText primary="导入数据（JSON）" />
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
          <ListItemText primary="载入示例简历" />
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
          <ListItemText primary="新建空白简历" />
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
        <DialogTitle>{confirm === 'sample' ? '载入示例简历？' : '新建空白简历？'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            当前内容会被覆盖。如需保留，请先通过「备份数据」导出 JSON。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setConfirm(null)}>
            取消
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              replace(confirm === 'sample' ? sampleData() : emptyData());
              setConfirm(null);
            }}
          >
            确定
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
