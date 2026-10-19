import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))

const extensionManifest = {
  manifest_version: 3,
  name: '砚边',
  description: '每次新建标签，先看见一首诗。',
  version: '1.0.0',
  chrome_url_overrides: {
    newtab: 'index.html'
  },
  icons: {
    16: 'icons/icon16.png',
    32: 'icons/icon32.png',
    48: 'icons/icon48.png',
    128: 'icons/icon128.png'
  }
}

function emitExtensionManifest() {
  return {
    name: 'yanbian-extension-manifest',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(extensionManifest, null, 2)
      })
      for (const size of [16, 32, 48, 128]) {
        this.emitFile({
          type: 'asset',
          fileName: `icons/icon${size}.png`,
          source: readFileSync(join(rootDir, 'ext-icons', `icon${size}.png`))
        })
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const extension = mode === 'extension'
  return {
    plugins: [vue(), extension && emitExtensionManifest()].filter(Boolean),
    // 网页发布在 /yanbian/；插件页从扩展自身打开，用相对路径
    base: command === 'build' ? (extension ? './' : '/yanbian/') : '/',
    build: extension ? { outDir: 'extension', emptyOutDir: true } : undefined,
    server: {
      open: true
    }
  }
})