<template>
  <div class="home" ref="captureRef">
    <div class="brand" role="img" aria-label="砚边" data-html2canvas-ignore :style="brandStyle"></div>
    <div class="toolbar" :class="{ shut: toolsShut }" data-html2canvas-ignore>
      <button
        type="button"
        class="tool tool-fold"
        :aria-expanded="!toolsShut"
        :aria-label="toolsShut ? '铺开' : '敛起'"
        :title="toolsShut ? '铺开' : '敛起'"
        @click="toggleTools"
      >
        <svg class="fold-arrow" :class="{ shut: toolsShut }" width="20" height="20" viewBox="4 4 16 16" fill="none" aria-hidden="true">
          <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="tool-set" :aria-hidden="toolsShut">
      <button type="button" class="tool" title="择一首" aria-label="择一首" @click="showInput = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15.5H7.5A2.5 2.5 0 0 0 5 21V5.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
          <path d="M5 18.5A2.5 2.5 0 0 1 7.5 16H19" stroke="currentColor" stroke-width="1.7"/>
        </svg>
      </button>
      <button
        type="button"
        class="tool"
        :class="{ kept: poemSaved }"
        :aria-pressed="poemSaved"
        :title="poemSaved ? '撤出箧中' : '藏入箧中'"
        :aria-label="poemSaved ? '撤出箧中' : '藏入箧中'"
        @click="togglePoemFav"
      >
        <svg v-if="poemSaved" width="20" height="20" viewBox="2.8 3.4 18.6 18.6" aria-hidden="true">
          <path fill="currentColor" d="M12 19.2 10.8 18.1C6.4 14.2 4 12 4 9.1 4 6.8 5.8 5 8.1 5c1.3 0 2.6.6 3.4 1.6C12.3 5.6 13.6 5 14.9 5 17.2 5 19 6.8 19 9.1c0 2.9-2.4 5.1-6.8 9L12 19.2Z"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="2.8 3.4 18.6 18.6" fill="none" aria-hidden="true">
          <path d="M12 18.6 10.9 17.6C6.8 13.9 4.6 11.9 4.6 9.2 4.6 7.1 6.2 5.5 8.3 5.5c1.2 0 2.4.6 3.1 1.5.7-.9 1.9-1.5 3.1-1.5 2.1 0 3.7 1.6 3.7 3.7 0 2.7-2.2 4.7-6.3 8.4L12 18.6Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        ref="gourdRef"
        type="button"
        class="tool"
        :class="{ kept: poemMarked }"
        :aria-pressed="showFavs"
        :title="favorites.length ? `所藏 ${favorites.length}` : '视所藏'"
        :aria-label="favorites.length ? `所藏 ${favorites.length}` : '视所藏'"
        @click="openFavs"
      >
        <svg v-if="poemMarked" class="fav-mark" :class="{ gulp: gourdGulp, spit: favSpit }" width="20" height="20" viewBox="0.6 0.4 22.8 22.8" aria-hidden="true">
          <path fill="currentColor" d="M7 3.8h10a1.2 1.2 0 0 1 1.2 1.2V21l-6.2-3.4L5.8 21V5a1.2 1.2 0 0 1 1.2-1.2Z"/>
        </svg>
        <svg v-else class="fav-mark" :class="{ gulp: gourdGulp, spit: favSpit }" width="20" height="20" viewBox="0.6 0.4 22.8 22.8" fill="none" aria-hidden="true">
          <path d="M7.2 4.2h9.6a1 1 0 0 1 1 1V20l-5.8-3.15L6.2 20V5.2a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round"/>
        </svg>
      </button>
      <button type="button" class="tool" title="更求一首" aria-label="更求一首" @click="anotherPoem">
        <svg width="20" height="20" viewBox="1.4 1.4 21.2 21.2" fill="none" aria-hidden="true">
          <path d="M20 12a8 8 0 1 1-2.3-5.6" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/>
          <path d="M20 4.5V9h-4.5" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        type="button"
        class="tool"
        :class="{ auto: autoPlay }"
        :aria-pressed="autoPlay"
        :title="autoPlay ? '止其自更' : '听其自更'"
        :aria-label="autoPlay ? '止其自更' : '听其自更'"
        @click="toggleAuto"
      >
        <svg v-if="autoPlay" width="20" height="20" viewBox="1.4 1.4 21.2 21.2" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.55"/>
          <path d="M10 9.5v5M14 9.5v5" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="1.4 1.4 21.2 21.2" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.55"/>
          <path d="M10.5 9.2l5 2.8-5 2.8V9.2Z" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        type="button"
        class="tool"
        :title="direction === 'h' ? '易为竖行' : '易为横行'"
        :aria-label="direction === 'h' ? '易为竖行' : '易为横行'"
        :aria-pressed="direction === 'v'"
        @click="direction = direction === 'h' ? 'v' : 'h'"
      >
        <span class="dir-swap">
          <svg class="dir-face" :class="{ on: direction === 'h' }" width="20" height="20" viewBox="1.4 1.4 21.2 21.2" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          <svg class="dir-face" :class="{ on: direction === 'v' }" width="20" height="20" viewBox="1.4 1.4 21.2 21.2" fill="none" aria-hidden="true">
            <path d="M8 4v16M12 4v16M16 4v16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </span>
      </button>
      <button type="button" class="tool" :class="{ done: copied }" :title="copied ? '已录于案' : '录其词句'" :aria-label="copied ? '已录于案' : '录其词句'" @click="copyPoem">
        <svg v-if="copied" width="20" height="20" viewBox="3 3 18 18" fill="none" aria-hidden="true">
          <path d="M5 12.5l4.2 4.2L19 7.5" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="2 2 20 20" fill="none" aria-hidden="true">
          <rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <path d="M6 16H5.5A1.5 1.5 0 0 1 4 14.5v-9A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      <button type="button" class="tool" :class="{ done: saved }" :title="saved ? '一幅已存' : '存此一幅'" :aria-label="saved ? '一幅已存' : '存此一幅'" @click="saveAsImage">
        <svg v-if="saved" width="20" height="20" viewBox="3 3 18 18" fill="none" aria-hidden="true">
          <path d="M5 12.5l4.2 4.2L19 7.5" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="2.2 2.5 19.6 19.6" fill="none" aria-hidden="true">
          <path d="M12 4v10m0 0l-3.5-3.5M12 14l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5 18.5h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      </div>
    </div>
    <div class="center-wrap">
      <PoemCard
        :dynasty="state.dynasty"
        :content="state.content"
        :poemName="state.poemName"
        :author="state.author"
        :type="state.type"
        :direction="direction"
        :kept-lines="keptLines"
        @collect="collectLines"
        @uncollect="uncollectLine"
      />
    </div>
    <WaveBg :waveColors="waveColors" />
    <Transition name="library">
      <div v-if="showFavs" class="modal-mask" @click.self="showFavs = false">
        <div class="modal-content fav-sheet">
          <h2 class="fav-title">收藏</h2>
          <p v-if="!favorites.length" class="fav-empty">还没有收藏</p>
          <TransitionGroup name="fav-gone" tag="ul" class="fav-list">
            <li v-for="item in favorites" :key="item.id" class="fav-item">
              <button type="button" class="fav-open" @click="openFav(item)">
                <span class="fav-lines">{{ item.whole ? `《${displayTitle(item.type, item.poemName)}》` : item.lines.join('\n') }}</span>
                <span class="fav-meta">{{ item.whole ? `整首 · ${item.author}` : `《${displayTitle(item.type, item.poemName)}》 ${item.author}` }}</span>
              </button>
              <button type="button" class="fav-drop" title="取消收藏" aria-label="取消收藏" @click="dropFav(item.id)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                </svg>
              </button>
            </li>
          </TransitionGroup>
        </div>
      </div>
    </Transition>
    <Transition name="library">
      <div v-if="showInput" class="modal-mask" @click.self="showInput = false">
        <div class="modal-content">
          <InputBox :type="state.type" @show="onInputShow" />
        </div>
      </div>
    </Transition>
    <div class="suck-layer" data-html2canvas-ignore aria-hidden="true">
      <span
        v-for="fly in flyers"
        :key="fly.id"
        class="suck-char"
        :class="{ go: fly.go, out: fly.out }"
        :style="{
          left: fly.x + 'px',
          top: fly.y + 'px',
          width: fly.size + 'px',
          height: fly.size + 'px',
          fontSize: fly.size + 'px',
          animationDelay: fly.delay + 'ms',
          '--dx': fly.dx + 'px',
          '--dy': fly.dy + 'px',
          '--spin': fly.spin + 'deg'
        }"
      >{{ fly.c }}</span>
    </div>
  </div>
</template>

<script setup>
import html2canvas from 'html2canvas'
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import PoemCard from '../components/PoemCard.vue'
import WaveBg from '../components/WaveBg.vue'
import InputBox from '../components/InputBox.vue'
import { displayTitle, layoutPoem } from '../utils/typeset.js'
import { library, loadLibrary } from '../data/library'

const captureRef = ref(null)
const brandSrc = `${import.meta.env.BASE_URL}logo.png`
const brandStyle = {
  WebkitMaskImage: `url("${brandSrc}")`,
  maskImage: `url("${brandSrc}")`
}

async function saveAsImage() {
  if (!captureRef.value) return
  window.scrollTo(0, 0)
  await document.fonts.ready // 等待字体加载
  await nextTick() // 等待DOM和样式完全渲染
  html2canvas(captureRef.value, {
    useCORS: true,
    backgroundColor: null,
    scale: window.devicePixelRatio,
    width: window.innerWidth,
    height: window.innerHeight,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    scrollX: 0,
    scrollY: 0,
    logging: true
  }).then(canvas => {
    const link = document.createElement('a')
    link.download = imageFileName()
    link.href = canvas.toDataURL('image/png')
    link.click()
    saved.value = true
    clearTimeout(savedTimer)
    savedTimer = window.setTimeout(() => {
      saved.value = false
    }, 1600)
  })
}

function filePart(value) {
  const text = String(value || '').replace(/[\\/:*?"<>|\s]+/g, '')
  return text || '未命名'
}

function imageFileName() {
  const title = filePart(displayTitle(state.type, state.poemName))
  const dynasty = filePart(dynastyShort(state.dynasty))
  const author = filePart(state.author)
  return `${title}-${dynasty}-${author}.png`
}

const showInput = ref(false)
const showFavs = ref(false)
const favStoreKey = 'yanbian-favs'
const favorites = ref(readFavs())
const direction = ref('h')
const copied = ref(false)
const saved = ref(false)
const toolsStoreKey = 'yanbian-tools'
function readToolsShut() {
  try {
    const stored = localStorage.getItem(toolsStoreKey)
    if (stored === 'open') return false
    return true
  } catch {
    return true
  }
}
const toolsShut = ref(readToolsShut())
function toggleTools() {
  toolsShut.value = !toolsShut.value
  try {
    localStorage.setItem(toolsStoreKey, toolsShut.value ? 'shut' : 'open')
  } catch {
    // 隐私模式写不进时，这一次的收放只留在当前页
  }
}
const autoPlay = ref(false)
let copiedTimer = 0
let savedTimer = 0
let autoTimer = 0
let suckTimer = 0
const gourdRef = ref(null)
const gourdGulp = ref(false)
const favSpit = ref(false)
const flyers = ref([])
const poolOf = { 唐诗: 'shi', 宋词: 'ci', 元曲: 'qu' }
const dynastyOf = { 唐诗: '唐代', 宋词: '宋代', 元曲: '元代' }

function onKeydown(event) {
  if (event.key !== 'Escape') return
  showInput.value = false
  showFavs.value = false
}

function readFavs() {
  try {
    const data = JSON.parse(localStorage.getItem(favStoreKey) || '[]')
    if (!Array.isArray(data)) return []
    return data.filter((item) => item && item.poemName && Array.isArray(item.lines) && item.lines.length && Array.isArray(item.content))
  } catch {
    return []
  }
}

function writeFavs() {
  try {
    localStorage.setItem(favStoreKey, JSON.stringify(favorites.value))
  } catch {
    // 隐私模式写不进时，收藏只留在这一次打开里
  }
}

function openFavs() {
  showInput.value = false
  showFavs.value = !showFavs.value
}

function wholeId() {
  return [state.type, state.poemName, state.author, 'whole'].join('\u0001')
}

const poemSaved = computed(() => favorites.value.some((item) => item.whole && item.id === wholeId()))

const keptLines = computed(() => {
  const texts = []
  for (const item of favorites.value) {
    if (item.whole) continue
    if (item.type !== state.type || item.poemName !== state.poemName || item.author !== state.author) continue
    for (const line of item.lines || []) {
      const text = String(line)
      if (text && !texts.includes(text)) texts.push(text)
    }
  }
  return texts
})

const poemMarked = computed(() => poemSaved.value || keptLines.value.length > 0)

function togglePoemFav() {
  const id = wholeId()
  if (poemSaved.value) {
    dropFav(id)
    return
  }
  const lines = [].concat(state.content || []).map((line) => String(line)).filter((line) => line.trim())
  if (!lines.length) return
  favorites.value = [{
    id,
    whole: true,
    type: state.type,
    dynasty: state.dynasty,
    poemName: state.poemName,
    author: state.author,
    content: [].concat(state.content || []),
    lines
  }, ...favorites.value.filter((item) => item.id !== id)]
  writeFavs()
}

function uncollectLine(text) {
  const line = String(text || '')
  if (!line) return
  let changed = false
  const next = []
  for (const item of favorites.value) {
    const samePoem = !item.whole
      && item.type === state.type
      && item.poemName === state.poemName
      && item.author === state.author
    if (!samePoem || !(item.lines || []).includes(line)) {
      next.push(item)
      continue
    }
    changed = true
    const lines = item.lines.filter((row) => row !== line)
    if (!lines.length) continue
    next.push({
      ...item,
      id: [item.type, item.poemName, item.author, ...lines].join('\u0001'),
      lines
    })
  }
  if (!changed) return
  const seen = new Set()
  releaseFromMark({ lines: [line] })
  favorites.value = next.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
  writeFavs()
}

function collectLines(lines, shots) {
  const picked = (lines || []).map((line) => String(line)).filter(Boolean)
  if (!picked.length) return
  const id = [state.type, state.poemName, state.author, ...picked].join('\u0001')
  const item = {
    id,
    type: state.type,
    dynasty: state.dynasty,
    poemName: state.poemName,
    author: state.author,
    content: [].concat(state.content || []),
    lines: picked
  }
  favorites.value = [item, ...favorites.value.filter((fav) => fav.id !== id)]
  writeFavs()
  suckIntoGourd(shots || [])
}

function suckIntoGourd(shots) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const gourd = gourdRef.value
  if (reduce || !gourd || !shots.length) return
  const dest = gourd.getBoundingClientRect()
  const cx = dest.left + dest.width / 2
  const cy = dest.top + dest.height / 2
  flyers.value = shots.map((shot, index) => {
    const size = shot.size || 32
    return {
      id: `${Date.now()}-${index}`,
      c: shot.c,
      x: shot.x,
      y: shot.y,
      size,
      dx: cx - (shot.x + size / 2),
      dy: cy - (shot.y + size / 2),
      delay: Math.min(index, 16) * 38,
      spin: (index % 2 ? 1 : -1) * (14 + (index % 4) * 5),
      go: false
    }
  })
  const wait = flyers.value.reduce((max, item) => Math.max(max, item.delay), 0) + 980
  nextTick(() => {
    requestAnimationFrame(() => {
      flyers.value = flyers.value.map((item) => ({ ...item, go: true }))
      gourdGulp.value = true
    })
  })
  clearTimeout(suckTimer)
  suckTimer = window.setTimeout(() => {
    flyers.value = []
    gourdGulp.value = false
  }, wait)
}

function dropFav(id) {
  const item = favorites.value.find((fav) => fav.id === id)
  if (item) releaseFromMark(item)
  favorites.value = favorites.value.filter((fav) => fav.id !== id)
  writeFavs()
}

function releaseFromMark(item) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mark = gourdRef.value
  if (reduce || !mark) return
  const source = item.whole ? String(item.poemName || '') : (item.lines || []).join('')
  const chars = [...source].filter((char) => String(char).trim()).slice(0, 14)
  if (!chars.length) return
  const dest = mark.getBoundingClientRect()
  const cx = dest.left + dest.width / 2
  const cy = dest.top + dest.height / 2
  const size = 26
  flyers.value = chars.map((char, index) => {
    const span = chars.length === 1 ? 0 : index / (chars.length - 1)
    const angle = (78 + span * 74) * Math.PI / 180
    const dist = 86 + (index % 4) * 22
    return {
      id: `out-${Date.now()}-${index}`,
      c: char,
      x: cx - size / 2,
      y: cy - size / 2,
      size,
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      delay: Math.min(index, 12) * 34,
      spin: (index % 2 ? 1 : -1) * (16 + (index % 3) * 6),
      go: false,
      out: true
    }
  })
  const wait = flyers.value.reduce((max, fly) => Math.max(max, fly.delay), 0) + 980
  nextTick(() => {
    requestAnimationFrame(() => {
      flyers.value = flyers.value.map((fly) => ({ ...fly, go: true }))
      favSpit.value = true
    })
  })
  clearTimeout(suckTimer)
  suckTimer = window.setTimeout(() => {
    flyers.value = []
    favSpit.value = false
  }, wait)
}

function openFav(item) {
  showFavs.value = false
  onInputShow({
    type: item.type,
    dynasty: item.dynasty,
    poemName: item.poemName,
    author: item.author,
    content: item.content.join('\n')
  })
}

function poemDwell() {
  const lines = (state.content || []).filter((line) => String(line).trim()).length || 4
  return Math.min(46000, Math.max(15000, 9000 + lines * 1600 + 2800))
}

function scheduleAuto() {
  clearTimeout(autoTimer)
  if (!autoPlay.value) return
  autoTimer = window.setTimeout(() => {
    if (!autoPlay.value) return
    if (showInput.value || showFavs.value) {
      scheduleAuto()
      return
    }
    anotherPoem()
  }, poemDwell())
}

function toggleAuto() {
  autoPlay.value = !autoPlay.value
  if (autoPlay.value) scheduleAuto()
  else clearTimeout(autoTimer)
}

const layoutOf = { 唐诗: 'h', 宋词: 'v', 元曲: 'h' }

async function anotherPoem() {
  try {
    await loadLibrary()
  } catch {
    return
  }
  const types = ['唐诗', '宋词', '元曲'].filter((type) => (library[poolOf[type]] || []).length)
  if (!types.length) return
  let type = types[Math.floor(Math.random() * types.length)]
  let pool = library[poolOf[type]]
  let pick = pool[Math.floor(Math.random() * pool.length)]
  for (let i = 0; i < 8 && type === state.type && pick.t === state.poemName && pick.a === state.author; i += 1) {
    type = types[Math.floor(Math.random() * types.length)]
    pool = library[poolOf[type]]
    pick = pool[Math.floor(Math.random() * pool.length)]
  }
  direction.value = layoutOf[type] || 'h'
  onInputShow({
    type,
    dynasty: dynastyOf[type] || state.dynasty,
    poemName: pick.t,
    author: pick.a,
    content: pick.p.join('\n')
  })
}

function dynastyShort(name) {
  const known = ['唐', '宋', '元', '明', '清', '晋', '汉', '魏', '隋', '周', '秦']
  const hit = known.find((item) => String(name || '').includes(item))
  return hit || String(name || '').replace(/代$/, '')
}

function poemClipboardText() {
  const title = displayTitle(state.type, state.poemName)
  const stanzas = layoutPoem(state.type, state.content, state.poemName)
  const body = stanzas
    .map((stanza) => stanza.lines.map((line) => line.text).join('\n'))
    .filter(Boolean)
    .join('\n\n')
  return `《${title}》\n${dynastyShort(state.dynasty)} · ${state.author}\n\n${body}`
}

async function copyPoem() {
  const text = poemClipboardText()
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.left = '-9999px'
    document.body.appendChild(area)
    area.select()
    document.execCommand('copy')
    area.remove()
  }
  copied.value = true
  clearTimeout(copiedTimer)
  copiedTimer = window.setTimeout(() => {
    copied.value = false
  }, 1600)
}
const poemStoreKey = 'yanbian-poem'
const defaultPoem = {
  type: '唐诗',
  dynasty: '唐代',
  content: ['红豆生南国，', '春来发几枝。', '愿君多采撷，', '此物最相思。'],
  poemName: '相思',
  author: '王维'
}

function readSavedPoem() {
  try {
    const data = JSON.parse(localStorage.getItem(poemStoreKey) || '')
    const content = Array.isArray(data.content) ? data.content.map((line) => String(line)) : []
    if (!data.poemName || !content.some((line) => line.trim())) return null
    return {
      type: data.type || defaultPoem.type,
      dynasty: data.dynasty || defaultPoem.dynasty,
      content,
      poemName: String(data.poemName),
      author: String(data.author || '')
    }
  } catch {
    return null
  }
}

const state = reactive(readSavedPoem() || defaultPoem)

watch(state, () => {
  try {
    localStorage.setItem(poemStoreKey, JSON.stringify({
      type: state.type,
      dynasty: state.dynasty,
      content: state.content,
      poemName: state.poemName,
      author: state.author
    }))
  } catch {
    // 隐私模式写不进本地记录时，这一次就只留在当前页
  }
}, { deep: true })
function onInputShow(val) {
  // 处理内容：去除每行所有空格
  let contentArr = val.content
    ? val.content.split('\n').map(line => line.replace(/\s+/g, ''))
    : ['']
  Object.assign(state, {
    type: val.type || '唐诗',
    dynasty: val.dynasty || '唐代',
    content: contentArr,
    poemName: val.poemName || '自定义',
    author: val.author || '用户'
  })
  showInput.value = false
  scheduleAuto()
}
// 禁止页面滚动
onMounted(() => {
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKeydown)
  loadLibrary().catch(() => {})
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  clearTimeout(copiedTimer)
  clearTimeout(savedTimer)
  clearTimeout(autoTimer)
  clearTimeout(suckTimer)
})
// 波浪颜色切换相关
const chineseColors = [
  '#6CA6CD', '#70A19F', '#B0D5DF', '#F6C555', '#D4A4A4', '#C7EDCC', '#F9D5A2', '#F7CAC9', '#B5D6E1', '#A3D2CA'
]
function getRandomColors() {
  let arr = []
  while (arr.length < 3) {
    let c = chineseColors[Math.floor(Math.random() * chineseColors.length)]
    if (!arr.includes(c)) arr.push(c)
  }
  return arr
}
const waveColors = ref(['#6CA6CD', '#70A19F', '#B0D5DF'])
function onWaveColorChange() {
  waveColors.value = getRandomColors()
}
</script>

<style scoped>
.brand {
  position: absolute;
  top: 14px;
  left: 18px;
  z-index: 20;
  width: 48px;
  height: 48px;
  background-color: var(--yanbian-ink, #6CA6CD);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-mode: alpha;
  mask-mode: alpha;
  pointer-events: none;
  user-select: none;
}
.toolbar {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(108, 166, 205, 0.22);
  box-shadow: 0 6px 18px rgba(70, 100, 120, 0.12);
  transition: right 0.42s cubic-bezier(0.22, 1, 0.36, 1), border-radius 0.42s ease, padding 0.42s ease;
}
.toolbar.shut {
  right: 0;
  padding-right: 2px;
  border-radius: 999px 0 0 999px;
  border-right: none;
}
.tool-set {
  display: flex;
  align-items: center;
  gap: 4px;
  max-width: 356px;
  overflow: hidden;
  transition: max-width 0.42s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease;
}
.toolbar.shut .tool-set {
  max-width: 0;
  opacity: 0;
  pointer-events: none;
}
.fold-arrow {
  transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}
.fold-arrow.shut {
  transform: rotate(180deg);
}
.tool {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: #7d8b96;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  position: relative;
  z-index: 1;
}
.tool:hover {
  color: #4d6270;
  background: transparent;
}
.tool.done {
  color: #e16c6c;
}
.tool.auto {
  color: #6CA6CD;
}
.tool.kept {
  color: #e16c6c;
}
.fav-mark {
  transform-origin: center center;
}
.fav-mark.gulp {
  animation: gourd-gulp 0.78s cubic-bezier(0.22, 1, 0.36, 1) 0.42s both;
}
.fav-mark.spit {
  animation: gourd-gulp 0.62s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes gourd-gulp {
  0% { transform: scale(1) rotate(0deg); }
  24% { transform: scale(1.28) rotate(-12deg); }
  48% { transform: scale(0.82) rotate(8deg); }
  72% { transform: scale(1.1) rotate(-4deg); }
  100% { transform: scale(1) rotate(0deg); }
}
.suck-layer {
  position: fixed;
  inset: 0;
  z-index: 40;
  pointer-events: none;
}
.suck-char {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'SongTi', 'Songti SC', 'STSong', 'SimSun', serif;
  color: #3a291c;
  line-height: 1;
  transform-origin: center center;
}
.suck-char.go {
  animation: suck-in 0.84s cubic-bezier(0.45, 0.02, 0.9, 0.4) both;
}
.suck-char.go.out {
  animation: spit-out 0.92s cubic-bezier(0.16, 0.72, 0.28, 1) both;
}
@keyframes spit-out {
  0% { transform: translate(0, 0) scale(0.08) rotate(0deg); opacity: 0; }
  22% { transform: translate(calc(var(--dx) * 0.28), calc(var(--dy) * 0.18)) scale(0.72) rotate(calc(var(--spin) * 0.3)); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(1.05) rotate(var(--spin)); opacity: 0; }
}
.fav-gone-leave-active {
  transition: opacity 0.32s ease, transform 0.32s ease;
}
.fav-gone-leave-to {
  opacity: 0;
  transform: translateX(22px);
}
.fav-gone-move {
  transition: transform 0.32s ease;
}
@keyframes suck-in {
  0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
  14% { transform: translate(0, -16px) scale(1.08) rotate(calc(var(--spin) * 0.25)); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(0.04) rotate(var(--spin)); opacity: 0; }
}
.toolbar svg {
  width: 20px;
  height: 20px;
  display: block;
  flex: none;
}
.dir-swap {
  position: relative;
  width: 20px;
  height: 20px;
}
.dir-face {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: rotate(-80deg) scale(0.72);
  transition: opacity 0.32s ease, transform 0.55s cubic-bezier(0.4, 0.02, 0.18, 1);
}
.dir-face.on {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}
.home {
  min-height: 100vh;
  height: 100vh;
  background: #fff;
  position: relative;
  overflow: hidden;
  transition: background 0.6s;
}
.center-wrap {
  min-height: 67vh;
  height: 67vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.modal-mask {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.35);
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 18px 16px 14px;
  max-width: 94vw;
  max-height: 86vh;
  overflow-x: hidden;
  overflow-y: auto;
  box-shadow: 0 18px 50px rgba(40, 60, 80, 0.16);
}
.fav-sheet {
  width: min(440px, 94vw);
  text-align: left;
  padding: 18px 16px 12px;
}
.fav-title {
  margin: 0 4px 12px;
  font-family: 'SongTi', 'Songti SC', 'STSong', 'SimSun', serif;
  font-size: 20px;
  font-weight: 500;
  color: #222;
}
.fav-empty {
  margin: 8px 4px 16px;
  color: #8a939b;
  font-size: 14px;
}
.fav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: min(60vh, 520px);
  overflow: auto;
}
.fav-item {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  border-top: 1px solid #f0f3f5;
}
.fav-open,
.fav-drop {
  border: none;
  background: transparent;
  border-radius: 0;
  font-family: 'SongTi', 'Songti SC', 'STSong', 'SimSun', serif;
}
.fav-open:hover,
.fav-open:focus,
.fav-drop:hover,
.fav-drop:focus,
.fav-open:focus-visible,
.fav-drop:focus-visible {
  border-color: transparent;
  outline: none;
  background: transparent;
}
.fav-open {
  flex: 1;
  min-width: 0;
  padding: 12px 4px;
  text-align: left;
  cursor: pointer;
  color: #222;
}
.fav-open:hover .fav-lines {
  color: #e16c6c;
}
.fav-lines {
  display: block;
  white-space: pre-line;
  line-height: 1.7;
  font-size: 16px;
}
.fav-meta {
  display: block;
  margin-top: 4px;
  color: #8a939b;
  font-size: 13px;
}
.fav-drop {
  width: 32px;
  height: 32px;
  margin-top: 8px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b0b8be;
  cursor: pointer;
  flex: none;
}
.fav-drop:hover {
  color: #e16c6c;
}
.library-enter-active,
.library-leave-active {
  transition: opacity 0.28s ease;
}
.library-enter-active .modal-content {
  transition: transform 0.48s cubic-bezier(0.22, 1, 0.36, 1);
}
.library-leave-active .modal-content {
  transition: transform 0.22s ease;
}
.library-enter-from,
.library-leave-to {
  opacity: 0;
}
.library-enter-from .modal-content {
  transform: translateY(22px) scale(0.97);
}
.library-leave-to .modal-content {
  transform: translateY(12px) scale(0.985);
}
@media (max-width: 720px) {
  .brand {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .library-enter-active,
  .library-leave-active,
  .library-enter-active .modal-content,
  .library-leave-active .modal-content,
  .dir-face,
  .toolbar,
  .tool-set,
  .fold-arrow,
  .suck-char,
  .fav-mark {
    transition: none;
    animation: none;
  }
}
</style> 