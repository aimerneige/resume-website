import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 纯静态站点：使用相对路径，dist/ 可部署到任意静态托管或子目录
export default defineConfig({
  base: './',
  plugins: [react()],
});
