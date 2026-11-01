import { useRef } from 'react';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import { useResume } from '../store';
import { SECTION_PRESETS, createCustomSection } from '../defaults';
import { useI18n } from '../i18n';
import BasicInfoEditor from './BasicInfoEditor';
import SectionEditor from './SectionEditors';

export default function EditorPanel() {
  const { data, update } = useResume();
  const { t } = useI18n();
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
          bgcolor: 'rgba(243,247,251,0.92)',
          backdropFilter: 'blur(6px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: { xs: 2, md: 3 },
          py: 1.25,
        }}
      >
        <Stack direction="row" sx={{ gap: 1, overflowX: 'auto', scrollbarWidth: 'none' }}>
          <Chip label={t('nav.basic')} size="small" onClick={() => jump('basic')} />
          {data.sections.map((s) => (
            <Chip
              key={s.id}
              label={s.title || t('common.untitled')}
              size="small"
              variant={s.visible ? 'filled' : 'outlined'}
              onClick={() => jump(s.id)}
            />
          ))}
          <Chip icon={<AddIcon />} label={t('nav.add')} size="small" variant="outlined" onClick={() => jump('add')} />
        </Stack>
      </Box>

      <Stack spacing={2} sx={{ p: { xs: 2, md: 3 }, maxWidth: 820, mx: 'auto' }}>
        <BasicInfoEditor />
        {data.sections.map((s, i) => (
          <SectionEditor key={s.id} section={s} index={i} count={data.sections.length} />
        ))}

        <Paper id="edit-add" variant="outlined" sx={{ p: 2.5, borderStyle: 'dashed', scrollMarginTop: 64 }}>
          <Typography variant="h6" sx={{ fontSize: 18 }}>
            {t('add.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('add.desc')}
          </Typography>
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
            {SECTION_PRESETS.map((p) => (
              <Button key={p.key} variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => add(() => p.create(t))}>
                {t(`preset.${p.key}`)}
              </Button>
            ))}
            <Button variant="contained" size="small" startIcon={<TuneIcon />} onClick={() => add(() => createCustomSection(t))}>
              {t('add.custom')}
            </Button>
          </Stack>
        </Paper>
        <Box sx={{ height: 40 }} />
      </Stack>
    </Box>
  );
}
