import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { useResume } from '../store';
import { LOCALES, makeT, useI18n, type Locale } from '../i18n';
import { sampleData } from '../samples';
import { emptyData } from '../defaults';
import type { ResumeData } from '../types';
import { ui } from '../theme';

interface DocActions {
  openLibrary: () => void;
  save: (asNew?: boolean) => void;
  loadSample: (locale: Locale) => void;
  newEmpty: () => void;
  /** 打开「我的简历」中的一份 */
  openSlot: (id: string) => void;
  /** 用外部数据（如导入的 JSON）替换当前简历，会先检查未保存的修改 */
  replaceGuarded: (d: ResumeData) => void;
  switchLocale: (l: Locale) => void;
  toast: (msg: string) => void;
}

const Ctx = createContext<DocActions | null>(null);

export function useDocActions() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useDocActions must be used inside DocActionsProvider');
  return c;
}

const freshFor = (kind: 'sample' | 'empty', l: Locale) => (kind === 'sample' ? sampleData(l) : emptyData(l, makeT(l)));

export function DocActionsProvider({ children }: { children: ReactNode }) {
  const { data, replace, isSaved, saveToLibrary, openFromLibrary } = useResume();
  const { t, locale, setLocale } = useI18n();
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [pending, setPending] = useState<null | (() => void)>(null);
  const [localeAsk, setLocaleAsk] = useState<Locale | null>(null);
  const [msg, setMsg] = useState('');

  const save = useCallback(
    (asNew = false) => {
      try {
        const item = saveToLibrary({ asNew });
        setMsg(t('lib.saved', { name: item.name || t('common.untitled') }));
        return true;
      } catch {
        setMsg(t('lib.saveFailed'));
        return false;
      }
    },
    [saveToLibrary, t],
  );

  /** 会替换当前内容的操作：有未保存的修改时先询问 */
  const guarded = useCallback(
    (action: () => void) => {
      if (isSaved) action();
      else setPending(() => action);
    },
    [isSaved],
  );

  const loadSample = useCallback((l: Locale) => guarded(() => replace(sampleData(l))), [guarded, replace]);
  const newEmpty = useCallback(() => guarded(() => replace(emptyData(locale, t))), [guarded, replace, locale, t]);
  const replaceGuarded = useCallback((d: ResumeData) => guarded(() => replace(d)), [guarded, replace]);
  const openSlot = useCallback((id: string) => guarded(() => openFromLibrary(id)), [guarded, openFromLibrary]);

  const switchLocale = useCallback(
    (l: Locale) => {
      if (l === locale) return;
      setLocale(l);
      // 未修改过的样例 / 空白简历：直接换成新语言的版本
      if (data.pristine) replace(freshFor(data.pristine.kind, l), null);
      else setLocaleAsk(l);
    },
    [locale, setLocale, data.pristine, replace],
  );

  // Ctrl / ⌘ + S 保存到浏览器
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const value: DocActions = {
    openLibrary: () => setLibraryOpen(true),
    save,
    loadSample,
    newEmpty,
    openSlot,
    replaceGuarded,
    switchLocale,
    toast: setMsg,
  };

  return (
    <Ctx.Provider value={value}>
      {children}

      <LibraryDialog open={libraryOpen} onClose={() => setLibraryOpen(false)} />

      {/* 未保存修改的确认 */}
      <Dialog open={!!pending} onClose={() => setPending(null)}>
        <DialogTitle>{t('guard.title')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t('guard.body')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setPending(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            color="inherit"
            onClick={() => {
              pending?.();
              setPending(null);
            }}
          >
            {t('guard.discard')}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (save()) pending?.();
              setPending(null);
            }}
          >
            {t('guard.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 切换语言时，已修改的简历是否换成新语言的样例 */}
      <Dialog open={!!localeAsk} onClose={() => setLocaleAsk(null)}>
        <DialogTitle>{t('locale.switchTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t('locale.switchBody')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setLocaleAsk(null)}>
            {t('locale.uiOnly')}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const l = localeAsk!;
              setLocaleAsk(null);
              if (isSaved || save()) replace(sampleData(l));
            }}
          >
            {t('locale.saveAndLoad')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!msg}
        autoHideDuration={3000}
        onClose={() => setMsg('')}
        message={msg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Ctx.Provider>
  );
}

function LibraryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { library, currentSlotId, renameInLibrary, deleteFromLibrary, isSaved } = useResume();
  const { t, locale } = useI18n();
  const actions = useDocActions();
  const [menu, setMenu] = useState<{ el: HTMLElement; id: string } | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const htmlLang = LOCALES.find((l) => l.id === locale)!.htmlLang;

  const fmt = (ms: number) =>
    new Date(ms).toLocaleString(htmlLang, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  const nameOf = (id: string) => library.find((s) => s.id === id)?.name || t('common.untitled');

  const exportJson = async (id: string) => {
    const item = library.find((s) => s.id === id);
    if (!item) return;
    const { downloadJson } = await import('../utils/exporter');
    downloadJson(item.data, item.name || t('app.defaultFileName'));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Stack direction="row" sx={{ alignItems: 'center', pl: 3, pr: 1.5, pt: 1.5 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          {t('lib.title')}
        </Typography>
        <IconButton onClick={onClose} aria-label={t('common.cancel')}>
          <CloseIcon />
        </IconButton>
      </Stack>
      <DialogContent sx={{ pt: 1 }}>
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Button variant="contained" startIcon={<SaveOutlinedIcon />} onClick={() => actions.save()} disabled={isSaved && !!currentSlotId}>
            {t('lib.saveCurrent')}
          </Button>
          {currentSlotId && (
            <Button variant="outlined" onClick={() => actions.save(true)}>
              {t('lib.saveAsNew')}
            </Button>
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
          {t('lib.note')}
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          {t('lib.savedList')}
        </Typography>
        {library.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            {t('lib.empty')}
          </Typography>
        ) : (
          <List dense disablePadding sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
            {library.map((s, i) => (
              <Box key={s.id}>
                {i > 0 && <Divider component="li" />}
                <ListItem
                  sx={{ py: 1, bgcolor: s.id === currentSlotId ? ui.tint : undefined }}
                  secondaryAction={
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                      <Button
                        size="small"
                        disabled={s.id === currentSlotId}
                        onClick={() => {
                          onClose();
                          actions.openSlot(s.id);
                        }}
                      >
                        {t('lib.open')}
                      </Button>
                      <IconButton size="small" onClick={(e) => setMenu({ el: e.currentTarget, id: s.id })}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  }
                >
                  {renaming?.id === s.id ? (
                    <TextField
                      autoFocus
                      size="small"
                      value={renaming.name}
                      onChange={(e) => setRenaming({ id: s.id, name: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          renameInLibrary(s.id, renaming.name.trim());
                          setRenaming(null);
                        }
                        if (e.key === 'Escape') {
                          e.stopPropagation();
                          setRenaming(null);
                        }
                      }}
                      onBlur={() => {
                        renameInLibrary(s.id, renaming.name.trim());
                        setRenaming(null);
                      }}
                      sx={{ mr: 16 }}
                    />
                  ) : (
                    <ListItemText
                      sx={{ pr: 14 }}
                      primary={
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                            {s.name || t('common.untitled')}
                          </Typography>
                          {s.id === currentSlotId && (
                            <Chip
                              size="small"
                              label={isSaved ? t('lib.current') : t('lib.unsaved')}
                              sx={{ height: 18, fontSize: 11 }}
                            />
                          )}
                        </Stack>
                      }
                      secondary={t('lib.savedTime', { time: fmt(s.savedAt) })}
                    />
                  )}
                </ListItem>
              </Box>
            ))}
          </List>
        )}

        <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 0.5 }}>
          {t('lib.samples')}
        </Typography>
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 1 }}>
          {t('lib.samplesHint')}
        </Typography>
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
          {LOCALES.map((l) => (
            <Button
              key={l.id}
              variant="outlined"
              size="small"
              startIcon={<ArticleOutlinedIcon />}
              lang={l.htmlLang}
              onClick={() => {
                onClose();
                actions.loadSample(l.id);
              }}
            >
              {l.label}
            </Button>
          ))}
          <Button
            size="small"
            startIcon={<NoteAddOutlinedIcon />}
            onClick={() => {
              onClose();
              actions.newEmpty();
            }}
          >
            {t('data.newEmpty')}
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions />

      <Menu anchorEl={menu?.el} open={!!menu} onClose={() => setMenu(null)}>
        <MenuItem
          onClick={() => {
            setRenaming({ id: menu!.id, name: library.find((s) => s.id === menu!.id)?.name ?? '' });
            setMenu(null);
          }}
        >
          {t('lib.rename')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            exportJson(menu!.id);
            setMenu(null);
          }}
        >
          {t('lib.exportJson')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleting(menu!.id);
            setMenu(null);
          }}
        >
          {t('common.delete')}
        </MenuItem>
      </Menu>

      <Dialog open={!!deleting} onClose={() => setDeleting(null)}>
        <DialogTitle>{deleting && t('lib.deleteTitle', { name: nameOf(deleting) })}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t('lib.deleteBody')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setDeleting(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              deleteFromLibrary(deleting!);
              setDeleting(null);
            }}
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

export const SaveTooltip = ({ children }: { children: React.ReactElement }) => {
  const { t } = useI18n();
  const { isSaved } = useResume();
  return <Tooltip title={isSaved ? t('lib.saveTip') : `${t('lib.unsaved')} · ${t('lib.saveTip')}`}>{children}</Tooltip>;
};
