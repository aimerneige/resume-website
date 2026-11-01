import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** 字体 CSS 只保留 woff2（现代浏览器均支持），避免把 .woff 副本一起打包 */
function woff2Only(): Plugin {
  return {
    name: 'woff2-only',
    enforce: 'pre',
    transform(code, id) {
      if (!/@fontsource\/.+\.css$/.test(id)) return null;
      return code.replace(/,\s*url\([^)]*\.woff\)\s*format\(['"]woff['"]\)/g, '');
    },
  };
}

// 纯静态站点：使用相对路径，dist/ 可部署到任意静态托管或子目录
export default defineConfig({
  base: './',
  plugins: [woff2Only(), react()],
});
