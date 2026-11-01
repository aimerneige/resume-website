import { useRef } from 'react';
import { Avatar, Box, Button, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import { useResume, move } from '../store';
import { uid } from '../defaults';
import { processAvatar } from '../utils/storage';
import type { BasicInfo } from '../types';
import SectionCard from './SectionCard';
import HeaderLayoutPicker from './HeaderLayoutPicker';
import { ui } from '../theme';
import { useI18n, type MessageKey } from '../i18n';

const FIELDS: { key: keyof Omit<BasicInfo, 'links' | 'avatar'>; label: MessageKey; placeholder?: MessageKey }[] = [
  { key: 'name', label: 'basic.name' },
  { key: 'title', label: 'basic.jobTitle' },
  { key: 'location', label: 'basic.location' },
  { key: 'phone', label: 'basic.phone' },
  { key: 'email', label: 'basic.email' },
  { key: 'birth', label: 'basic.birth', placeholder: 'basic.birthPlaceholder' },
  { key: 'wechat', label: 'basic.wechat' },
];

export default function BasicInfoEditor() {
  const { data, update } = useResume();
  const { t } = useI18n();
  const b = data.basic;
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      const url = await processAvatar(file);
      update((d) => {
        d.basic.avatar = url;
      });
    } catch {
      alert(t('basic.photoError'));
    }
  };

  return (
    <SectionCard id="basic" title={t('basic.title')} description={t('basic.desc')}>
      <HeaderLayoutPicker />
      <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2.5 }}>
        <Avatar variant="rounded" src={b.avatar || undefined} sx={{ width: 60, height: 80, bgcolor: ui.tint, color: ui.muted }}>
          <PersonOutlineIcon />
        </Avatar>
        <Box>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" onClick={() => fileRef.current?.click()}>
              {b.avatar ? t('basic.photoChange') : t('basic.photoUpload')}
            </Button>
            {b.avatar && (
              <Button
                size="small"
                color="inherit"
                onClick={() =>
                  update((d) => {
                    d.basic.avatar = '';
                  })
                }
              >
                {t('common.delete')}
              </Button>
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {t('basic.photoHint')}
          </Typography>
        </Box>
        <input
          ref={fileRef}
          hidden
          type="file"
          accept="image/*"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        {FIELDS.map((f) => (
          <TextField
            key={f.key}
            label={t(f.label)}
            placeholder={f.placeholder && t(f.placeholder)}
            value={b[f.key]}
            onChange={(e) =>
              update((d) => {
                d.basic[f.key] = e.target.value;
              })
            }
          />
        ))}
      </Box>

      <Typography variant="subtitle2" sx={{ mt: 3, mb: 0.5, fontWeight: 700 }}>
        {t('basic.links')}
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 1.5 }}>
        {t('basic.linksHint')}
      </Typography>
      <Stack spacing={1.5}>
        {b.links.map((l, i) => (
          <Stack key={l.id} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
            <TextField
              label={t('basic.linkLabel')}
              value={l.label}
              sx={{ width: { sm: 120 }, flexShrink: 0 }}
              onChange={(e) =>
                update((d) => {
                  d.basic.links[i].label = e.target.value;
                })
              }
            />
            <TextField
              label={t('basic.linkValue')}
              value={l.value}
              onChange={(e) =>
                update((d) => {
                  d.basic.links[i].value = e.target.value;
                })
              }
            />
            <TextField
              label={t('basic.linkUrl')}
              value={l.url}
              placeholder="https://"
              onChange={(e) =>
                update((d) => {
                  d.basic.links[i].url = e.target.value;
                })
              }
            />
            <Stack direction="row" sx={{ flexShrink: 0 }}>
              <Tooltip title={t('common.moveUp')}>
                <span>
                  <IconButton
                    size="small"
                    disabled={i === 0}
                    onClick={() => update((d) => move(d.basic.links, i, i - 1))}
                  >
                    <KeyboardArrowUpIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={t('common.delete')}>
                <IconButton
                  size="small"
                  onClick={() =>
                    update((d) => {
                      d.basic.links.splice(i, 1);
                    })
                  }
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        ))}
      </Stack>
      <Button
        startIcon={<AddIcon />}
        sx={{ mt: 1 }}
        onClick={() =>
          update((d) => {
            d.basic.links.push({ id: uid(), label: '', value: '', url: '' });
          })
        }
      >
        {t('basic.addLink')}
      </Button>
    </SectionCard>
  );
}
