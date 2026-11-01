import type { ReactNode } from 'react';
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import TitleIcon from '@mui/icons-material/Title';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import { useSection, move } from '../store';
import { TONES, newCustomBlock, uid } from '../defaults';
import { useI18n } from '../i18n';
import type { Align, CustomBlock, CustomSection, Tone } from '../types';

function NumSlider(p: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" sx={{ justifyContent: "space-between" }}>
        <Typography variant="caption" color="text.secondary">
          {p.label}
        </Typography>
        <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {p.value}
          {p.unit ?? 'px'}
        </Typography>
      </Stack>
      <Slider
        size="small"
        value={p.value}
        min={p.min}
        max={p.max}
        step={p.step ?? 1}
        onChange={(_, v) => p.onChange(v as number)}
        sx={{ py: 1 }}
      />
    </Box>
  );
}

function IconTip({ title, children, onClick, disabled }: { title: string; children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <Tooltip title={title}>
      <span>
        <IconButton size="small" onClick={onClick} disabled={disabled}>
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
}

export default function CustomEditor({ id }: { id: string }) {
  const [s, patch] = useSection<CustomSection>(id);
  const { t } = useI18n();
  const set = (i: number, fn: (b: CustomBlock) => void) =>
    patch((x) => {
      fn(x.blocks[i]);
    });

  return (
    <>
      <FormControlLabel
        sx={{ mb: 1.5 }}
        control={
          <Switch
            size="small"
            checked={s.showTitle}
            onChange={(e) =>
              patch((x) => {
                x.showTitle = e.target.checked;
              })
            }
          />
        }
        label={t('custom.showTitle')}
        slotProps={{ typography: { variant: 'body2' } }}
      />

      <Stack spacing={1.5}>
        {s.blocks.map((b, i) => (
          <Paper key={b.id} variant="outlined" sx={{ p: 1.5, bgcolor: '#f7fafd' }}>
            <Stack direction="row" sx={{ alignItems: "center", mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                {b.kind === 'divider' ? t('custom.divider') : t('custom.block', { n: i + 1 })}
              </Typography>
              <IconTip title={t('common.moveUp')} disabled={i === 0} onClick={() => patch((x) => move(x.blocks, i, i - 1))}>
                <KeyboardArrowUpIcon fontSize="small" />
              </IconTip>
              <IconTip
                title={t('common.moveDown')}
                disabled={i === s.blocks.length - 1}
                onClick={() => patch((x) => move(x.blocks, i, i + 1))}
              >
                <KeyboardArrowDownIcon fontSize="small" />
              </IconTip>
              <IconTip
                title={t('common.duplicate')}
                onClick={() =>
                  patch((x) => {
                    x.blocks.splice(i + 1, 0, { ...x.blocks[i], id: uid() });
                  })
                }
              >
                <ContentCopyIcon sx={{ fontSize: 16 }} />
              </IconTip>
              <IconTip
                title={t('common.delete')}
                onClick={() =>
                  patch((x) => {
                    x.blocks.splice(i, 1);
                  })
                }
              >
                <CloseIcon fontSize="small" />
              </IconTip>
            </Stack>

            {b.kind === 'text' && (
              <>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    multiline
                    minRows={1}
                    placeholder={t('custom.textPlaceholder')}
                    value={b.text}
                    onChange={(e) => set(i, (x) => void (x.text = e.target.value))}
                    sx={{ bgcolor: '#fff' }}
                  />
                  <TextField
                    placeholder={t('custom.rightPlaceholder')}
                    value={b.rightText}
                    onChange={(e) => set(i, (x) => void (x.rightText = e.target.value))}
                    sx={{ width: { sm: 160 }, flexShrink: 0, bgcolor: '#fff' }}
                  />
                </Stack>

                <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                  <ToggleButtonGroup
                    size="small"
                    value={[b.bold && 'b', b.italic && 'i', b.underline && 'u'].filter(Boolean)}
                    onChange={(_, v: string[]) =>
                      set(i, (x) => {
                        x.bold = v.includes('b');
                        x.italic = v.includes('i');
                        x.underline = v.includes('u');
                      })
                    }
                  >
                    <ToggleButton value="b" aria-label={t('custom.bold')}>
                      <FormatBoldIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="i" aria-label={t('custom.italic')}>
                      <FormatItalicIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="u" aria-label={t('custom.underline')}>
                      <FormatUnderlinedIcon fontSize="small" />
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={b.align}
                    onChange={(_, v: Align | null) => v && set(i, (x) => void (x.align = v))}
                  >
                    <ToggleButton value="left" aria-label={t('custom.alignLeft')}>
                      <FormatAlignLeftIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="center" aria-label={t('custom.alignCenter')}>
                      <FormatAlignCenterIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="right" aria-label={t('custom.alignRight')}>
                      <FormatAlignRightIcon fontSize="small" />
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <ToneSelect value={b.tone} onChange={(v) => set(i, (x) => void (x.tone = v))} />
                </Stack>
                {b.rightText && b.align !== 'left' && (
                  <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
                    {t('custom.rightTextNote')}
                  </Typography>
                )}

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
                    columnGap: 2,
                    mt: 1,
                  }}
                >
                  <NumSlider label={t('custom.fontSize')} value={b.fontSize} min={10} max={36} onChange={(v) => set(i, (x) => void (x.fontSize = v))} />
                  <NumSlider label={t('custom.marginTop')} value={b.marginTop} min={0} max={60} onChange={(v) => set(i, (x) => void (x.marginTop = v))} />
                  <NumSlider label={t('custom.indent')} value={b.indent} min={0} max={200} step={2} onChange={(v) => set(i, (x) => void (x.indent = v))} />
                  <NumSlider
                    label={t('custom.lineHeight')}
                    value={b.lineHeight}
                    min={1}
                    max={2.5}
                    step={0.05}
                    unit={t('custom.times')}
                    onChange={(v) => set(i, (x) => void (x.lineHeight = v))}
                  />
                </Box>
              </>
            )}

            {b.kind === 'divider' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', columnGap: 2, alignItems: 'center' }}>
                <NumSlider label={t('custom.marginTop')} value={b.marginTop} min={0} max={60} onChange={(v) => set(i, (x) => void (x.marginTop = v))} />
                <ToneSelect value={b.tone} onChange={(v) => set(i, (x) => void (x.tone = v))} />
              </Box>
            )}
          </Paper>
        ))}
      </Stack>

      <Divider sx={{ my: 1.5 }} />
      <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={() =>
            patch((x) => {
              x.blocks.push(newCustomBlock());
            })
          }
        >
          {t('custom.addText')}
        </Button>
        <Button
          startIcon={<TitleIcon />}
          onClick={() =>
            patch((x) => {
              x.blocks.push(newCustomBlock({ text: t('custom.headingDefault'), fontSize: 15, bold: true, marginTop: 12 }));
            })
          }
        >
          {t('custom.addHeading')}
        </Button>
        <Button
          startIcon={<HorizontalRuleIcon />}
          onClick={() =>
            patch((x) => {
              x.blocks.push(newCustomBlock({ kind: 'divider', tone: 'light', marginTop: 10 }));
            })
          }
        >
          {t('custom.addDivider')}
        </Button>
      </Stack>
    </>
  );
}

function ToneSelect({ value, onChange }: { value: Tone; onChange: (v: Tone) => void }) {
  const { t } = useI18n();
  return (
    <Select
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value as Tone)}
      sx={{ minWidth: 96, bgcolor: '#fff', '& .MuiSelect-select': { py: 0.75, display: 'flex', alignItems: 'center', gap: 1 } }}
    >
      {(Object.keys(TONES) as Tone[]).map((tone) => (
        <MenuItem key={tone} value={tone} sx={{ gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: TONES[tone], flexShrink: 0 }} />
          {t(`tone.${tone}`)}
        </MenuItem>
      ))}
    </Select>
  );
}
