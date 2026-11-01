import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import { useResume } from '../store';
import { PAGE_H, PAGE_W, computePageBreaks } from '../utils/pagination';
import Resume from './Resume';
import { ui } from '../theme';

export default function PreviewPanel({ resumeRef }: { resumeRef: RefObject<HTMLDivElement | null> }) {
  const { data } = useResume();
  const box = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  const [zoom, setZoom] = useState<number | null>(null); // null = 自适应宽度
  const [height, setHeight] = useState(PAGE_H);
  const [breaks, setBreaks] = useState<number[]>([]);
  const scale = zoom ?? fit;

  // 自适应宽度
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setFit(Math.min(1.2, (el.clientWidth - 48) / PAGE_W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 简历高度与分页位置
  useLayoutEffect(() => {
    const el = resumeRef.current;
    if (!el) return;
    const measure = () => {
      setHeight(el.offsetHeight);
      setBreaks(computePageBreaks(el, data.style.padY));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const imgs = Array.from(el.querySelectorAll('img'));
    imgs.forEach((img) => img.addEventListener('load', measure));
    return () => {
      ro.disconnect();
      imgs.forEach((img) => img.removeEventListener('load', measure));
    };
  }, [data, scale, resumeRef]);

  const pages = breaks.length + 1;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: ui.previewBg }}>
      <Stack
        direction="row"
       
        sx={{ alignItems: "center", px: 2, py: 0.75, borderBottom: '1px solid', borderColor: 'divider', bgcolor: ui.previewBar }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          A4 预览 · 共 {pages} 页
        </Typography>
        <Tooltip title="缩小">
          <IconButton size="small" onClick={() => setZoom(Math.max(0.3, +(scale - 0.1).toFixed(2)))}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="body2" sx={{ width: 48, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(scale * 100)}%
        </Typography>
        <Tooltip title="放大">
          <IconButton size="small" onClick={() => setZoom(Math.min(2, +(scale + 0.1).toFixed(2)))}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="适应宽度">
          <IconButton size="small" onClick={() => setZoom(null)} color={zoom === null ? 'primary' : 'default'}>
            <FitScreenIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box ref={box} sx={{ flex: 1, overflow: 'auto', py: 3 }}>
        <Box sx={{ width: PAGE_W * scale, height: height * scale, mx: 'auto', position: 'relative' }}>
          <Paper
            elevation={3}
            sx={{
              width: PAGE_W,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
              borderRadius: 0,
              overflow: 'hidden',
            }}
          >
            <Resume ref={resumeRef} data={data} />
            {data.style.showPageGuides &&
              breaks.map((y, i) => (
                <Box
                  key={i}
                  className="page-guide"
                  sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: y,
                    borderTop: `1px dashed ${ui.primaryLight}`,
                    pointerEvents: 'none',
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: -10,
                      fontSize: 11,
                      color: ui.primary,
                      bgcolor: '#fff',
                      px: 0.75,
                    }}
                  >
                    第 {i + 1} 页结束
                  </Typography>
                </Box>
              ))}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
