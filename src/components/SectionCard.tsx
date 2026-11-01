import { useState, type ReactNode } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { ui } from '../theme';

interface Props {
  id: string;
  title: string;
  description?: ReactNode;
  /** 可改名时传入 */
  onRename?: (title: string) => void;
  visible?: boolean;
  onToggleVisible?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  /** 标题栏右侧的额外设置（如单双栏切换） */
  toolbar?: ReactNode;
  children: ReactNode;
}

export default function SectionCard(p: Props) {
  const [confirm, setConfirm] = useState(false);
  const hidden = p.visible === false;

  return (
    <Paper
      id={`edit-${p.id}`}
      variant="outlined"
      sx={{ p: { xs: 2, sm: 2.5 }, scrollMarginTop: 64, opacity: hidden ? 0.6 : 1, transition: 'opacity .2s' }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5, minHeight: 36 }}>
        {p.onRename ? (
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <InputBase
              value={p.title}
              onChange={(e) => p.onRename!(e.target.value)}
              placeholder="模块标题"
              sx={{
                fontSize: 18,
                fontWeight: 700,
                flex: 1,
                '& input': { py: 0.25, borderBottom: '1px dashed transparent' },
                '& input:hover, & input:focus': { borderBottomColor: ui.primaryLight },
              }}
            />
            <EditOutlinedIcon fontSize="small" sx={{ color: 'text.disabled', ml: 0.5 }} />
          </Box>
        ) : (
          <Typography variant="h6" sx={{ flex: 1, fontSize: 18 }}>
            {p.title}
          </Typography>
        )}
        <Stack direction="row" spacing={0.25} sx={{ alignItems: "center", flexShrink: 0 }}>
          {p.onToggleVisible && (
            <Tooltip title={hidden ? '在简历中显示' : '在简历中隐藏'}>
              <IconButton size="small" onClick={p.onToggleVisible}>
                {hidden ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
          {p.onMoveUp && (
            <Tooltip title="上移模块">
              <IconButton size="small" onClick={p.onMoveUp}>
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {p.onMoveDown && (
            <Tooltip title="下移模块">
              <IconButton size="small" onClick={p.onMoveDown}>
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {p.onDelete && (
            <Tooltip title="删除模块">
              <IconButton size="small" onClick={() => setConfirm(true)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
      {p.toolbar && (
        <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1, mb: 1 }}>
          {p.toolbar}
        </Stack>
      )}
      {p.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {p.description}
        </Typography>
      )}
      {p.children}

      <Dialog open={confirm} onClose={() => setConfirm(false)}>
        <DialogTitle>删除「{p.title || '未命名模块'}」？</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            模块内的所有内容都会被删除，此操作无法撤销。若只是暂时不需要，可以点击眼睛图标隐藏。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(false)} color="inherit">
            取消
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setConfirm(false);
              p.onDelete!();
            }}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
