import type { ReactNode } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';
import { ui } from '../theme';
import { useI18n } from '../i18n';

interface Props {
  expanded: boolean;
  onToggle: () => void;
  title: string;
  subtitle?: string;
  onUp?: () => void;
  onDown?: () => void;
  onDelete: () => void;
  children: ReactNode;
}

/** 列表条目：折叠时只显示摘要，展开后直接编辑 */
export default function ItemAccordion(p: Props) {
  const { t } = useI18n();
  const stop = (fn?: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn?.();
  };
  return (
    <Accordion expanded={p.expanded} onChange={p.onToggle} slotProps={{ transition: { unmountOnExit: true } }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ '& .MuiAccordionSummary-content': { my: 1, alignItems: 'center', minWidth: 0 } }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
            {p.title || <span style={{ color: ui.muted }}>{t('common.empty')}</span>}
          </Typography>
          {p.subtitle && (
            <Typography variant="caption" color="text.secondary" noWrap component="div">
              {p.subtitle}
            </Typography>
          )}
        </Box>
        <Stack direction="row" sx={{ flexShrink: 0, mr: 0.5 }}>
          <Tooltip title={t('common.moveUp')}>
            <span>
              <IconButton size="small" disabled={!p.onUp} onClick={stop(p.onUp)} component="span">
                <KeyboardArrowUpIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('common.moveDown')}>
            <span>
              <IconButton size="small" disabled={!p.onDown} onClick={stop(p.onDown)} component="span">
                <KeyboardArrowDownIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('common.delete')}>
            <IconButton size="small" onClick={stop(p.onDelete)} component="span">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>{p.children}</AccordionDetails>
    </Accordion>
  );
}
