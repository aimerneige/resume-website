import { useRef } from 'react';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import { useResume } from '../store';
import { SECTION_PRESETS, newCustomSection } from '../defaults';
import BasicInfoEditor from './BasicInfoEditor';
import SectionEditor from './SectionEditors';

export default function EditorPanel() {
  const { data, update } = useResume();
  const scroller = useRef<HTMLDivElement>(null);

  const jump = (id: string) =>
    document.getElementById(`edit-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const add = (create: () => (typeof data.sections)[number]) => {
    const s = create();
    update((d) => {
      d.sections.push(s);
    });
    setTimeout(() => jump(s.id), 50);
  };

  return (
    <Box ref={scroller} sx={{ height: '100%', overflowY: 'auto', bgcolor: 'background.default' }}>
      {/* 模块导航 */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          bgcolor: 'rgba(244,244,244,0.92)',
          backdropFilter: 'blur(6px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: { xs: 2, md: 3 },
          py: 1.25,
        }}
      >
        <Stack direction="row" sx={{ gap: 1, overflowX: 'auto', scrollbarWidth: 'none' }}>
          <Chip label="基本信息" size="small" onClick={() => jump('basic')} />
          {data.sections.map((s) => (
            <Chip
              key={s.id}
              label={s.title || '未命名'}
              size="small"
              variant={s.visible ? 'filled' : 'outlined'}
              onClick={() => jump(s.id)}
            />
          ))}
          <Chip icon={<AddIcon />} label="添加模块" size="small" variant="outlined" onClick={() => jump('add')} />
        </Stack>
      </Box>

      <Stack spacing={2} sx={{ p: { xs: 2, md: 3 }, maxWidth: 820, mx: 'auto' }}>
        <BasicInfoEditor />
        {data.sections.map((s, i) => (
          <SectionEditor key={s.id} section={s} index={i} count={data.sections.length} />
        ))}

        <Paper id="edit-add" variant="outlined" sx={{ p: 2.5, borderStyle: 'dashed', scrollMarginTop: 64 }}>
          <Typography variant="h6" sx={{ fontSize: 18 }}>
            添加模块
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            选择固定模板快速添加，或使用完全自定义模块自由排版。大道至简，只放与岗位相关的内容。
          </Typography>
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
            {SECTION_PRESETS.map((p) => (
              <Button key={p.label} variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => add(p.create)}>
                {p.label}
              </Button>
            ))}
            <Button variant="contained" size="small" startIcon={<TuneIcon />} onClick={() => add(() => newCustomSection())}>
              完全自定义模块
            </Button>
          </Stack>
        </Paper>
        <Box sx={{ height: 40 }} />
      </Stack>
    </Box>
  );
}
