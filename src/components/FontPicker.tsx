import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  List,
  ListItemButton,
  Radio,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { BUILTIN_FONTS, LOCAL_PREFIX, fontStack, loadBuiltinFont } from '../fonts/registry';
import { useFonts } from '../fonts/FontsProvider';
import { FONT_ACCEPT, FontError } from '../fonts/localFonts';
import { ui } from '../theme';
import { useI18n } from '../i18n';

const SAMPLE = { zh: '简历 张三 Aa 123', ja: '履歴書 山田 Aa 123', en: 'Résumé Aa 123' } as const;
const fmtSize = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export default function FontPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { localFonts, add, remove, storageError, stackOf } = useFonts();
  const { t, locale } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // 打开面板时加载全部内置字体，用于名称预览（只下载预览文字所需分片）
  useEffect(() => {
    BUILTIN_FONTS.forEach((f) => loadBuiltinFont(f.id));
  }, []);

  const onFile = async (file?: File) => {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const m = await add(file);
      onChange(LOCAL_PREFIX + m.id);
    } catch (e) {
      setError(e instanceof FontError ? t(`font.err.${e.code}`) : String(e));
    } finally {
      setBusy(false);
    }
  };

  const item = (id: string, family: string, title: string, sample: string, extra: React.ReactNode, action?: React.ReactNode) => {
    const selected = value === id;
    return (
      <ListItemButton
        key={id}
        selected={selected}
        onClick={() => onChange(id)}
        sx={{ borderRadius: 1, py: 0.5, px: 1, alignItems: 'center', '&.Mui-selected': { bgcolor: ui.tint } }}
      >
        <Radio size="small" checked={selected} tabIndex={-1} sx={{ p: 0.5, mr: 1 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontFamily: family, fontSize: 15, lineHeight: 1.5 }}>
            {sample}
          </Typography>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
            <Typography variant="caption" color="text.secondary" noWrap>
              {title}
            </Typography>
            {extra}
          </Stack>
        </Box>
        {action}
      </ListItemButton>
    );
  };

  return (
    <Box>
      <List dense disablePadding>
        {BUILTIN_FONTS.map((f) =>
          item(
            f.id,
            fontStack(f.id, new Set()),
            f.name,
            SAMPLE[f.lang],
            <Chip label={t(`font.lang.${f.lang}`)} size="small" variant="outlined" sx={{ height: 16, fontSize: 10, '& .MuiChip-label': { px: 0.6 } }} />,
          ),
        )}
      </List>

      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5, mb: 1.5 }}>
        {t('font.builtinNote')}
      </Typography>

      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
        {t('font.local')}
      </Typography>
      {localFonts.length > 0 && (
        <List dense disablePadding>
          {localFonts.map((f) =>
            item(
              LOCAL_PREFIX + f.id,
              stackOf(LOCAL_PREFIX + f.id),
              f.name,
              SAMPLE[locale],
              <Typography variant="caption" color="text.disabled">
                {fmtSize(f.size)}
              </Typography>,
              <Tooltip title={t('font.delete')}>
                <IconButton
                  size="small"
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (value === LOCAL_PREFIX + f.id) onChange(BUILTIN_FONTS[0].id);
                    remove(f.id);
                  }}
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>,
            ),
          )}
        </List>
      )}
      <Button
        size="small"
        variant="outlined"
        startIcon={busy ? <CircularProgress size={14} /> : <UploadFileOutlinedIcon />}
        disabled={busy || storageError}
        onClick={() => fileRef.current?.click()}
        sx={{ mt: 1 }}
      >
        {t('font.upload')}
      </Button>
      <input
        ref={fileRef}
        hidden
        type="file"
        accept={FONT_ACCEPT}
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>
        {t('font.uploadNote')}
      </Typography>
      {(error || storageError) && (
        <Alert severity="warning" sx={{ mt: 1 }} onClose={error ? () => setError('') : undefined}>
          {error || t('font.err.storage')}
        </Alert>
      )}
    </Box>
  );
}
