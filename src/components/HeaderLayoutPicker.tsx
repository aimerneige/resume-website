import {
  Box,
  ButtonBase,
  FormControlLabel,
  Slider,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useResume } from '../store';
import type { ContactStyle, HeaderLayout, StyleSettings } from '../types';
import { ui } from '../theme';
import { useI18n } from '../i18n';

const LAYOUTS: HeaderLayout[] = ['center', 'left', 'avatarLeft', 'split'];
const CONTACTS: ContactStyle[] = ['inline', 'grid', 'stacked'];

/** 抬头版式示意图（黑灰线条） */
function LayoutThumb({ layout }: { layout: HeaderLayout }) {
  const photo = <Box sx={{ width: 12, height: 16, bgcolor: '#bdbdbd', borderRadius: '2px', flexShrink: 0 }} />;
  const name = <Box sx={{ height: 5, width: 26, bgcolor: '#212121' }} />;
  const line = (w: number | string) => <Box sx={{ height: 2, width: w, bgcolor: '#9e9e9e' }} />;
  const text = (align: 'center' | 'flex-start' | 'flex-end', w = 34) => (
    <Stack spacing={0.4} sx={{ alignItems: align }}>
      {name}
      {line(w)}
    </Stack>
  );
  return (
    <Box sx={{ width: '100%', height: 36, px: 0.75, display: 'flex', alignItems: 'center', gap: 0.75, position: 'relative' }}>
      {layout === 'center' && (
        <>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{text('center')}</Box>
          <Box sx={{ position: 'absolute', right: 6, top: 10 }}>{photo}</Box>
        </>
      )}
      {layout === 'left' && (
        <>
          <Box sx={{ flex: 1 }}>{text('flex-start')}</Box>
          {photo}
        </>
      )}
      {layout === 'avatarLeft' && (
        <>
          {photo}
          <Box sx={{ flex: 1 }}>{text('flex-start')}</Box>
        </>
      )}
      {layout === 'split' && (
        <>
          {name}
          <Stack spacing={0.4} sx={{ ml: 'auto', alignItems: 'flex-end' }}>
            {line(18)}
            {line(22)}
            {line(16)}
          </Stack>
        </>
      )}
    </Box>
  );
}

export default function HeaderLayoutPicker() {
  const { data, update } = useResume();
  const { t } = useI18n();
  const st = data.style;
  const set = <K extends keyof StyleSettings>(k: K, v: StyleSettings[K]) =>
    update((d) => {
      d.style[k] = v;
    });

  return (
    <Box sx={{ mb: 2.5, p: 1.5, borderRadius: 2, bgcolor: ui.tint }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        {t('header.title')}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 1 }}>
        {LAYOUTS.map((l) => {
          const active = st.headerLayout === l;
          return (
            <ButtonBase
              key={l}
              aria-pressed={active}
              onClick={() => set('headerLayout', l)}
              sx={{
                flexDirection: 'column',
                alignItems: 'stretch',
                borderRadius: 1.5,
                bgcolor: '#fff',
                border: '1.5px solid',
                borderColor: active ? 'primary.main' : 'divider',
                boxShadow: active ? `0 0 0 2px ${ui.tint}` : 'none',
                pt: 0.75,
                pb: 0.5,
                transition: 'border-color .15s',
                '&:hover': { borderColor: active ? 'primary.main' : 'primary.light' },
              }}
            >
              <LayoutThumb layout={l} />
              <Typography variant="caption" sx={{ mt: 0.5, fontWeight: active ? 700 : 400, color: active ? 'primary.main' : 'text.secondary' }}>
                {t(`header.layout.${l}`)}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 3 }} sx={{ mt: 1.5, alignItems: { sm: 'center' } }}>
        <Box sx={{ flexShrink: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {t('header.contacts')}
          </Typography>
          <ToggleButtonGroup size="small" exclusive value={st.contactStyle} onChange={(_, v) => v && set('contactStyle', v)} sx={{ bgcolor: '#fff' }}>
            {CONTACTS.map((c) => (
              <ToggleButton key={c} value={c} sx={{ px: 1.5, py: 0.25 }}>
                {t(`header.contacts.${c}`)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ flex: 1, minWidth: 120 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              {t('header.nameSize')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {Math.round(st.fontSize * st.nameScale)}px
            </Typography>
          </Stack>
          <Slider size="small" min={1.4} max={3} step={0.1} value={st.nameScale} onChange={(_, v) => set('nameScale', v as number)} />
        </Box>
      </Stack>

      <Stack direction="row" sx={{ flexWrap: 'wrap', columnGap: 2 }}>
        <FormControlLabel
          control={<Switch size="small" checked={st.contactLabels} onChange={(e) => set('contactLabels', e.target.checked)} />}
          label={<Typography variant="body2">{t('header.labels')}</Typography>}
        />
        <FormControlLabel
          control={<Switch size="small" checked={st.titleBelow} onChange={(e) => set('titleBelow', e.target.checked)} />}
          label={<Typography variant="body2">{t('header.titleBelow')}</Typography>}
        />
      </Stack>
    </Box>
  );
}
