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
import { ui } from '../theme';

const FIELDS: { key: keyof Omit<BasicInfo, 'links' | 'avatar'>; label: string; placeholder?: string }[] = [
  { key: 'name', label: '姓名' },
  { key: 'title', label: '求职意向 / 职位' },
  { key: 'location', label: '所在城市' },
  { key: 'phone', label: '手机号码' },
  { key: 'email', label: '电子邮箱' },
  { key: 'birth', label: '出生年月', placeholder: '如 1995/04' },
  { key: 'wechat', label: '微信号' },
];

export default function BasicInfoEditor() {
  const { data, update } = useResume();
  const b = data.basic;
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      const url = await processAvatar(file);
      update((d) => {
        d.basic.avatar = url;
      });
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <SectionCard id="basic" title="基本信息" description="个人信息与联系方式，留空的字段不会出现在简历上。">
      <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2.5 }}>
        <Avatar variant="rounded" src={b.avatar || undefined} sx={{ width: 60, height: 80, bgcolor: ui.tint, color: ui.muted }}>
          <PersonOutlineIcon />
        </Avatar>
        <Box>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" onClick={() => fileRef.current?.click()}>
              {b.avatar ? '更换照片' : '上传照片'}
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
                删除
              </Button>
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            自动裁成 3:4 并转为黑白，保证打印效果
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
            label={f.label}
            placeholder={f.placeholder}
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
        自定义链接 / 信息
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 1.5 }}>
        如 GitHub、个人网站、作品集，也可以写「政治面貌：党员」这类文字信息。
      </Typography>
      <Stack spacing={1.5}>
        {b.links.map((l, i) => (
          <Stack key={l.id} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
            <TextField
              label="名称"
              value={l.label}
              sx={{ width: { sm: 120 }, flexShrink: 0 }}
              onChange={(e) =>
                update((d) => {
                  d.basic.links[i].label = e.target.value;
                })
              }
            />
            <TextField
              label="显示文字"
              value={l.value}
              onChange={(e) =>
                update((d) => {
                  d.basic.links[i].value = e.target.value;
                })
              }
            />
            <TextField
              label="链接（可选）"
              value={l.url}
              placeholder="https://"
              onChange={(e) =>
                update((d) => {
                  d.basic.links[i].url = e.target.value;
                })
              }
            />
            <Stack direction="row" sx={{ flexShrink: 0 }}>
              <Tooltip title="上移">
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
              <Tooltip title="删除">
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
        添加一项
      </Button>
    </SectionCard>
  );
}
