import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  // GitHub Pages 项目页发布在 /SongCi/ 子路径下，构建时需要带上 base
  base: command === 'build' ? '/SongCi/' : '/',
  server: {
    open: true
  }
}))