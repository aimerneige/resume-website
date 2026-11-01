import { useState } from 'react';
import { Box, Button, FormControlLabel, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useResume, useSection, move } from '../store';
import { TIMELINE_LABELS, newSkillItem, newTimelineItem } from '../defaults';
import type { Section, SkillsSection, TextSection, TimelineSection } from '../types';
import SectionCard from './SectionCard';
import ItemAccordion from './ItemAccordion';
import CustomEditor from './CustomEditor';

export const FORMAT_HINT = '每行一段；以「- 」开头为列表，「1. 」为编号，**文字** 加粗';

function ContentField({ value, onChange, label = '描述', rows = 4 }: { value: string; onChange: (v: string) => void; label?: string; rows?: number }) {
  return (
    <TextField
      label={label}
      multiline
      minRows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      helperText={FORMAT_HINT}
    />
  );
}

function ColumnSwitch({ value, onChange }: { value: 1 | 2; onChange: (v: 1 | 2) => void }) {
  return (
    <ToggleButtonGroup size="small" exclusive value={value} onChange={(_, v) => v && onChange(v)}>
      <ToggleButton value={1} sx={{ px: 1.5, py: 0.25 }}>
        单栏
      </ToggleButton>
      <ToggleButton value={2} sx={{ px: 1.5, py: 0.25 }}>
        双栏
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

/** 用于列表型模块：记录当前展开的条目 */
function useExpanded(initial?: string) {
  const [open, setOpen] = useState<string | null>(initial ?? null);
  return [open, (id: string) => setOpen((o) => (o === id ? null : id)), setOpen] as const;
}

function TextEditor({ id }: { id: string }) {
  const [s, patch] = useSection<TextSection>(id);
  return (
    <ContentField
      label="内容"
      rows={4}
      value={s.content}
      onChange={(v) =>
        patch((x) => {
          x.content = v;
        })
      }
    />
  );
}

function TimelineEditor({ id }: { id: string }) {
  const [s, patch] = useSection<TimelineSection>(id);
  const L = TIMELINE_LABELS[s.kind];
  const [open, toggle, setOpen] = useExpanded(s.items.length === 1 && !s.items[0].title ? s.items[0].id : undefined);

  return (
    <>
      {s.items.map((it, i) => (
        <ItemAccordion
          key={it.id}
          expanded={open === it.id}
          onToggle={() => toggle(it.id)}
          title={[it.title, it.subtitle].filter(Boolean).join(' - ')}
          subtitle={[it.meta, [it.start, it.end].filter(Boolean).join(' - ')].filter(Boolean).join('  ·  ')}
          onUp={i > 0 ? () => patch((x) => move(x.items, i, i - 1)) : undefined}
          onDown={i < s.items.length - 1 ? () => patch((x) => move(x.items, i, i + 1)) : undefined}
          onDelete={() =>
            patch((x) => {
              x.items.splice(i, 1);
            })
          }
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {(['title', 'subtitle', 'meta'] as const).map((k) => (
              <TextField
                key={k}
                label={L[k]}
                value={it[k]}
                onChange={(e) =>
                  patch((x) => {
                    x.items[i][k] = e.target.value;
                  })
                }
              />
            ))}
            <Stack direction="row" spacing={1}>
              <TextField
                label="开始"
                placeholder="2020/09"
                value={it.start}
                onChange={(e) =>
                  patch((x) => {
                    x.items[i].start = e.target.value;
                  })
                }
              />
              <TextField
                label="结束"
                placeholder="至今"
                value={it.end}
                onChange={(e) =>
                  patch((x) => {
                    x.items[i].end = e.target.value;
                  })
                }
              />
            </Stack>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <ContentField
                value={it.content}
                onChange={(v) =>
                  patch((x) => {
                    x.items[i].content = v;
                  })
                }
              />
            </Box>
          </Box>
        </ItemAccordion>
      ))}
      <Button
        startIcon={<AddIcon />}
        sx={{ mt: 1 }}
        onClick={() => {
          const item = newTimelineItem();
          patch((x) => {
            x.items.push(item);
          });
          setOpen(item.id);
        }}
      >
        {L.add}
      </Button>
    </>
  );
}

function SkillsEditor({ id }: { id: string }) {
  const [s, patch] = useSection<SkillsSection>(id);
  const [open, toggle, setOpen] = useExpanded();
  return (
    <>
      {s.items.map((it, i) => (
        <ItemAccordion
          key={it.id}
          expanded={open === it.id}
          onToggle={() => toggle(it.id)}
          title={it.name}
          subtitle={s.tagMode ? undefined : it.content.split('\n')[0]?.replace(/^\s*[-*•]\s*/, '')}
          onUp={i > 0 ? () => patch((x) => move(x.items, i, i - 1)) : undefined}
          onDown={i < s.items.length - 1 ? () => patch((x) => move(x.items, i, i + 1)) : undefined}
          onDelete={() =>
            patch((x) => {
              x.items.splice(i, 1);
            })
          }
        >
          <Stack spacing={2}>
            <TextField
              label={s.tagMode ? '技能标签' : '技能名称'}
              value={it.name}
              onChange={(e) =>
                patch((x) => {
                  x.items[i].name = e.target.value;
                })
              }
            />
            {!s.tagMode && (
              <ContentField
                label="技能描述"
                rows={3}
                value={it.content}
                onChange={(v) =>
                  patch((x) => {
                    x.items[i].content = v;
                  })
                }
              />
            )}
          </Stack>
        </ItemAccordion>
      ))}
      <Button
        startIcon={<AddIcon />}
        sx={{ mt: 1 }}
        onClick={() => {
          const item = newSkillItem();
          patch((x) => {
            x.items.push(item);
          });
          setOpen(item.id);
        }}
      >
        添加专业技能
      </Button>
    </>
  );
}

const DESCRIPTIONS: Record<string, string> = {
  text: '一段简短的文字，支持列表与加粗。',
  skills: '不要只罗列名词，写清楚掌握程度和应用场景。标签模式只显示技能名称。',
  custom: '完全自定义的内容：每个文本块都可以单独调整字号、对齐、灰度、缩进和间距，右侧文字会贴右对齐（适合写日期）。',
};

export default function SectionEditor({ section, index, count }: { section: Section; index: number; count: number }) {
  const { update } = useResume();
  const patch = (fn: (s: Section) => void) =>
    update((d) => {
      const s = d.sections.find((x) => x.id === section.id);
      if (s) fn(s as Section);
    });

  let toolbar = null;
  if (section.type === 'timeline')
    toolbar = (
      <ColumnSwitch
        value={section.columns}
        onChange={(v) =>
          patch((s) => {
            (s as TimelineSection).columns = v;
          })
        }
      />
    );
  if (section.type === 'skills')
    toolbar = (
      <>
        <ColumnSwitch
          value={section.columns}
          onChange={(v) =>
            patch((s) => {
              (s as SkillsSection).columns = v;
            })
          }
        />
        <FormControlLabel
          sx={{ ml: 1 }}
          control={
            <Switch
              size="small"
              checked={section.tagMode}
              onChange={(e) =>
                patch((s) => {
                  (s as SkillsSection).tagMode = e.target.checked;
                })
              }
            />
          }
          label="标签展示"
          slotProps={{ typography: { variant: 'body2' } }}
        />
      </>
    );

  return (
    <SectionCard
      id={section.id}
      title={section.title}
      onRename={(t) =>
        patch((s) => {
          s.title = t;
        })
      }
      visible={section.visible}
      onToggleVisible={() =>
        patch((s) => {
          s.visible = !s.visible;
        })
      }
      onMoveUp={index > 0 ? () => update((d) => move(d.sections, index, index - 1)) : undefined}
      onMoveDown={index < count - 1 ? () => update((d) => move(d.sections, index, index + 1)) : undefined}
      onDelete={() =>
        update((d) => {
          d.sections.splice(index, 1);
        })
      }
      toolbar={toolbar}
      description={section.type === 'timeline' ? TIMELINE_LABELS[section.kind].hint : DESCRIPTIONS[section.type]}
    >
      {section.type === 'text' && <TextEditor id={section.id} />}
      {section.type === 'timeline' && <TimelineEditor id={section.id} />}
      {section.type === 'skills' && <SkillsEditor id={section.id} />}
      {section.type === 'custom' && <CustomEditor id={section.id} />}
    </SectionCard>
  );
}
