import type { ReactNode } from 'react';
import {
  Box,
  ButtonBase,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  Slider,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useResume } from '../store';
import { TEMPLATES } from '../defaults';
import type { StyleSettings, TemplateId } from '../types';
import { ui } from '../theme';

function Row({ label, value, children }: { label: string; value?: ReactNode; children: ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        {value !== undefined && (
          <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </Typography>
        )}
      </Stack>
      {children}
    </Box>
  );
}

/** 模板缩略图（纯黑灰示意） */
function Thumb({ id }: { id: TemplateId }) {
  const t = TEMPLATES[id].style;
  const center = t.headerAlign === 'center';
  const heading = (
    <Box
      sx={{
        height: 5,
        width: '40%',
        bgcolor: t.headingStyle === 'fill' ? '#bdbdbd' : '#424242',
        ...(t.headingStyle === 'bar' && { borderLeft: '3px solid #000', bgcolor: '#757575' }),
        ...(t.headingStyle === 'underline' && { width: '100%', height: 3, bgcolor: 'transparent', borderBottom: '1.5px solid #000' }),
        ...(t.headingStyle === 'fill' && { width: '100%' }),
      }}
    />
  );
  const lines = (
    <Stack spacing={0.4} sx={{ mt: 0.5, mb: 1 }}>
      <Box sx={{ height: 2, bgcolor: '#d0d0d0' }} />
      <Box sx={{ height: 2, bgcolor: '#d0d0d0', width: '80%' }} />
    </Stack>
  );
  return (
    <Box sx={{ bgcolor: '#fff', aspectRatio: '210/297', p: `${(t.padX ?? 48) / 8}px`, border: '1px solid #e0e0e0' }}>
      <Stack spacing={0.4} sx={{ alignItems: center ? 'center' : 'flex-start', mb: 1 }}>
        <Box sx={{ height: 6, width: '45%', bgcolor: '#212121' }} />
        <Box sx={{ height: 2, width: '70%', bgcolor: '#9e9e9e' }} />
      </Stack>
      {heading}
      {lines}
      {heading}
      {lines}
      {heading}
      {lines}
    </Box>
  );
}

export default function StyleDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, update } = useResume();
  const st = data.style;
  const set = <K extends keyof StyleSettings>(k: K, v: StyleSettings[K]) =>
    update((d) => {
      d.style[k] = v;
    });

  const applyTemplate = (id: TemplateId) =>
    update((d) => {
      Object.assign(d.style, TEMPLATES[id].style, { template: id });
    });

  return (
    <Drawer anchor="right" open={open} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 380 } } } }}>
      <Stack direction="row" sx={{ alignItems: "center", px: 2.5, py: 1.5 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          简历样式
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Stack>
      <Divider />
      <Box sx={{ p: 2.5, overflowY: 'auto' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          模板
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.25, mb: 3 }}>
          {(Object.keys(TEMPLATES) as TemplateId[]).map((id) => (
            <ButtonBase
              key={id}
              onClick={() => applyTemplate(id)}
              sx={{
                display: 'block',
                textAlign: 'left',
                borderRadius: 1,
                p: 0.75,
                outline: st.template === id ? `2px solid ${ui.primary}` : '1px solid transparent',
                '&:hover': { bgcolor: ui.tint },
              }}
            >
              <Thumb id={id} />
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, mt: 0.5 }}>
                {TEMPLATES[id].name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3, fontSize: 10 }}>
                {TEMPLATES[id].desc}
              </Typography>
            </ButtonBase>
          ))}
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          细节调整
        </Typography>

        <Row label="字体">
          <ToggleButtonGroup fullWidth size="small" exclusive value={st.fontFamily} onChange={(_, v) => v && set('fontFamily', v)}>
            <ToggleButton value="sans">黑体（无衬线）</ToggleButton>
            <ToggleButton value="serif" sx={{ fontFamily: 'serif' }}>
              宋体（衬线）
            </ToggleButton>
          </ToggleButtonGroup>
        </Row>

        <Row label="模块标题样式">
          <ToggleButtonGroup fullWidth size="small" exclusive value={st.headingStyle} onChange={(_, v) => v && set('headingStyle', v)}>
            <ToggleButton value="bar">竖条</ToggleButton>
            <ToggleButton value="underline">下划线</ToggleButton>
            <ToggleButton value="fill">灰底</ToggleButton>
            <ToggleButton value="plain">无</ToggleButton>
          </ToggleButtonGroup>
        </Row>

        <Row label="抬头对齐">
          <ToggleButtonGroup fullWidth size="small" exclusive value={st.headerAlign} onChange={(_, v) => v && set('headerAlign', v)}>
            <ToggleButton value="center">居中</ToggleButton>
            <ToggleButton value="left">居左</ToggleButton>
          </ToggleButtonGroup>
        </Row>

        <Row label="正文字号" value={`${st.fontSize}px`}>
          <Slider size="small" min={11} max={17} step={0.5} value={st.fontSize} onChange={(_, v) => set('fontSize', v as number)} />
        </Row>
        <Row label="行高" value={`${st.lineHeight.toFixed(2)} 倍`}>
          <Slider size="small" min={1.2} max={2.2} step={0.05} value={st.lineHeight} onChange={(_, v) => set('lineHeight', v as number)} />
        </Row>
        <Row label="模块间距" value={`${st.sectionGap}px`}>
          <Slider size="small" min={8} max={48} value={st.sectionGap} onChange={(_, v) => set('sectionGap', v as number)} />
        </Row>
        <Row label="左右页边距" value={`${st.padX}px`}>
          <Slider size="small" min={20} max={96} step={2} value={st.padX} onChange={(_, v) => set('padX', v as number)} />
        </Row>
        <Row label="上下页边距" value={`${st.padY}px`}>
          <Slider size="small" min={20} max={96} step={2} value={st.padY} onChange={(_, v) => set('padY', v as number)} />
        </Row>

        <Divider sx={{ my: 1 }} />
        <FormControlLabel
          control={<Switch checked={st.showAvatar} onChange={(e) => set('showAvatar', e.target.checked)} />}
          label="显示照片"
        />
        <FormControlLabel
          control={<Switch checked={st.showPageGuides} onChange={(e) => set('showPageGuides', e.target.checked)} />}
          label="预览中显示分页线"
        />
      </Box>
    </Drawer>
  );
}
