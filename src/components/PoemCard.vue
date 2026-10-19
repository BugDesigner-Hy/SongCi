<template>
  <div ref="cardRef" class="poem-card" :class="kindClass" :style="cardMotionStyle">
    <div class="stage" :style="{ height: stageHeight + 'px', fontSize: hFont + 'px' }">
      <span v-if="pill" class="author-tag" :style="pillStyle">
        <span class="author-ink" :class="hStain"></span>
        <span class="author-words" :class="{ on: shown === 'h' && sealPhase !== 'out' }">{{ dynastyShort }} · {{ shownAuthor }}</span>
      </span>
      <span v-if="pill" class="author-tag author-tag-v" :style="vPillStyle">
        <span class="author-ink" :class="vStain"></span>
      </span>
      <span
        v-for="glyph in glyphs"
        :key="glyph.id"
        class="glyph"
        :class="{ chen: glyph.chen }"
        :style="glyphStyle(glyph)"
      >{{ glyph.c }}</span>
      <div v-if="!motion && !scattered" class="verses" data-html2canvas-ignore>
        <button
          v-for="row in verseRows"
          :key="row.key"
          type="button"
          class="verse"
          :class="{ on: picked.includes(row.key), kept: lineKept(row.text), ink: inkSet.has(row.key), v: shown === 'v' }"
          :style="verseStyle(row)"
          :aria-pressed="picked.includes(row.key)"
          :aria-label="row.text"
          @click="toggleLine(row)"
          @dblclick.stop.prevent="onVerseDblClick(row)"
        >
          <span class="verse-line" :style="hairStyle"></span>
        </button>
        <button
          v-if="freshPicked.length"
          type="button"
          class="keep"
          :style="keepStyle"
          title="收藏金句"
          aria-label="收藏金句"
          @click="collectPicked"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 .65c.5 1.05.2 1.8-.6 2.3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
            <path d="M12.9 1.65c1.5-.75 2.8 0 3.1 1.1" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/>
            <path d="M12 3.15c-3.1 0-5.3 1.75-5.3 4.15 0 1.85 1.35 3.2 3 3.75-2.8.8-5.3 3-5.3 5.65 0 3.45 3.4 6 7.6 6s7.6-2.55 7.6-6c0-2.65-2.5-4.85-5.3-5.65 1.65-.55 3-1.9 3-3.75 0-2.4-2.2-4.15-5.3-4.15Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
            <path d="M9.15 11.2c.85.42 1.8.65 2.85.65s2-.23 2.85-.65" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { displayTitle, layoutPoem } from '../utils/typeset.js'

const props = defineProps(['dynasty', 'content', 'poemName', 'author', 'type', 'direction', 'keptLines'])
const emit = defineEmits(['collect', 'uncollect'])
const picked = ref([])
const suckingIds = ref([])
let suckTimer = 0

const cardRef = ref(null)
const stageW = ref(typeof window === 'undefined' ? 360 : Math.min(window.innerWidth - 48, 960))
const vh = ref(typeof window === 'undefined' ? 700 : window.innerHeight)
const dpr = ref(typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1)
const shown = ref(props.direction || 'h')
const motion = ref(false)
const stainLive = ref(false)
const sealPhase = ref('settled')
const scattered = ref(false)
const swap = ref('')
const assemble = ref(false)
const cloudBox = ref({ w: 640, h: 360 })
const renderType = ref(props.type)
const renderDynasty = ref(props.dynasty)
const renderContent = ref(props.content)
const renderName = ref(props.poemName)
const renderAuthor = ref(props.author)
let motionToken = 0
let motionTimer = 0
let resizeObserver

function onResize() {
  vh.value = window.innerHeight
  dpr.value = window.devicePixelRatio || 1
  if (cardRef.value) stageW.value = cardRef.value.clientWidth || stageW.value
}

onMounted(() => {
  onResize()
  resizeObserver = new ResizeObserver(onResize)
  if (cardRef.value) resizeObserver.observe(cardRef.value)
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', onResize)
  clearTimeout(motionTimer)
  clearTimeout(suckTimer)
})

function poemIncoming() {
  return props.type !== renderType.value
    || props.poemName !== renderName.value
    || props.author !== renderAuthor.value
    || [].concat(props.content || []).join('\n') !== [].concat(renderContent.value || []).join('\n')
}

watch(() => props.direction, async (next) => {
  if (!next || next === shown.value || poemIncoming()) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    shown.value = next
    return
  }
  const token = ++motionToken
  swap.value = ''
  assemble.value = false
  scattered.value = false
  motion.value = true
  await nextTickPaint()
  if (token !== motionToken) return
  stainLive.value = true
  shown.value = next
  clearTimeout(motionTimer)
  motionTimer = window.setTimeout(() => {
    if (token !== motionToken) return
    motion.value = false
    stainLive.value = false
  }, 2000)
})

watch(
  () => `${props.type}|${props.poemName}|${props.author}|${[].concat(props.content || []).join('\n')}`,
  async () => {
    const next = {
      type: props.type,
      dynasty: props.dynasty,
      content: props.content,
      poemName: props.poemName,
      author: props.author
    }
    const same = next.type === renderType.value
      && next.poemName === renderName.value
      && next.author === renderAuthor.value
      && [].concat(next.content || []).join('\n') === [].concat(renderContent.value || []).join('\n')
    if (same) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      applyRender(next)
      return
    }
    const token = ++motionToken
    clearTimeout(motionTimer)
    swap.value = ''
    assemble.value = false
    scattered.value = false
    sealPhase.value = 'out'
    motion.value = true
    cloudBox.value = {
      w: stageW.value || 640,
      h: Math.max(stageHeight.value || 0, 280)
    }
    await nextTickPaint()
    if (token !== motionToken) return
    swap.value = 'break'
    await wait(1280)
    if (token !== motionToken) return
    applyRender(next)
    await nextTick()
    if (token !== motionToken) return
    cloudBox.value = {
      w: stageW.value || 640,
      h: Math.max(stageHeight.value || 0, 280)
    }
    swap.value = 'seed'
    scattered.value = true
    motion.value = false
    await nextTickPaint()
    if (token !== motionToken) return
    motion.value = true
    swap.value = ''
    scattered.value = false
    assemble.value = true
    sealPhase.value = 'in'
    await wait(1560)
    if (token !== motionToken) return
    motion.value = false
    assemble.value = false
    sealPhase.value = 'settled'
  }
)

function applyRender(next) {
  renderType.value = next.type
  renderDynasty.value = next.dynasty
  renderContent.value = next.content
  renderName.value = next.poemName
  renderAuthor.value = next.author
  if (props.direction === 'h' || props.direction === 'v') shown.value = props.direction
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function cloudPos(id) {
  let hash = 2166136261
  const text = String(id)
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  const unit = (shift) => ((hash >>> shift) & 1023) / 1023
  const width = cloudBox.value.w
  const height = cloudBox.value.h
  return {
    x: 16 + unit(0) * Math.max(width - 88, 48),
    y: 12 + unit(10) * Math.max(height - 72, 40),
    scale: 0.82 + unit(20) * 0.22
  }
}

function nextTickPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  })
}

const kindClass = computed(() => {
  if (renderType.value === '宋词') return 'kind-ci'
  if (renderType.value === '元曲') return 'kind-qu'
  return 'kind-shi'
})

const shownAuthor = computed(() => renderAuthor.value || '')
const shownTitle = computed(() => displayTitle(renderType.value, renderName.value))
const layout = computed(() => {
  const stanzas = layoutPoem(renderType.value, renderContent.value, renderName.value)
  return stanzas.map((stanza) => ({
    ...stanza,
    lines: stanza.lines.map((line) => ({
      ...line,
      chars: line.tokens.flatMap((token) => Array.from(token.t).map((c) => ({ c, chen: token.chen })))
    }))
  }))
})

const dynastyShort = computed(() => {
  const name = renderDynasty.value || ''
  const known = ['唐', '宋', '元', '明', '清', '晋', '汉', '魏', '隋', '周', '秦']
  const hit = known.find((item) => name.includes(item))
  if (hit) return hit
  return name.replace(/代$/, '')
})

const track = computed(() => (renderType.value === '唐诗' ? 0.16 : 0.08))
const lineFactor = computed(() => (renderType.value === '唐诗' ? 2 : 1.85))

const measure = computed(() => {
  let cols = 2
  let maxChars = Math.max(Array.from(shownTitle.value).length, Array.from(`${dynastyShort.value}·${props.author || ''}`).length, 1)
  let longest = 1
  let lineCount = 0
  for (const stanza of layout.value) {
    cols += stanza.lines.length
    if (stanza.guopian) cols += 0.6
    lineCount += stanza.lines.length
    stanza.lines.forEach((line, index) => {
      const extra = stanza.guopian && index === 0 ? 2 : 0
      longest = Math.max(longest, Array.from(line.text).length + extra)
      maxChars = Math.max(maxChars, line.chars.length + (stanza.guopian && index === 0 ? 2 : 0))
    })
  }
  return { cols, maxChars, longest, lineCount }
})

const hFont = computed(() => {
  const { longest, lineCount } = measure.value
  const roomy = (stageW.value || 0) >= 560
  let preferred = renderType.value === '唐诗' ? 30 : 22
  if (roomy) preferred = renderType.value === '唐诗' ? 44 : 32
  if (renderType.value === '唐诗') {
    if (lineCount > 12) preferred = roomy ? 30 : 22
    else if (lineCount > 8) preferred = roomy ? 36 : 26
  } else if (lineCount > 16 || longest > 18) preferred = roomy ? 22 : 16
  else if (lineCount > 10) preferred = roomy ? 26 : 18
  else if (lineCount > 6) preferred = roomy ? 28 : 20
  const available = Math.min(stageW.value || 360, roomy ? 600 : 520) * (roomy ? 0.92 : 0.9)
  const fit = available / (longest * (1 + track.value))
  let size = Math.min(preferred, fit)
  if (roomy) {
    const budget = lineCount * lineFactor.value + 3.2
    size = Math.min(size, (vh.value * 0.62) / Math.max(budget, 1))
  }
  return Math.max(13, size)
})

const vFont = computed(() => {
  const { cols, maxChars } = measure.value
  const byH = (vh.value * 0.56) / Math.max(maxChars, 1)
  const byW = (Math.min(stageW.value || 360, 640) * 0.92) / (cols * 1.35)
  return Math.max(13, Math.min(26, byH, byW))
})

const placed = computed(() => placeGlyphs({
  layout: layout.value,
  title: shownTitle.value,
  byline: `${dynastyShort.value}·${shownAuthor.value}`,
  width: stageW.value || 360,
  hFont: hFont.value,
  vFont: vFont.value,
  track: track.value,
  lineFactor: lineFactor.value
}))

const glyphs = computed(() => placed.value.glyphs)
const stageHeight = computed(() => placed.value.height)
const pill = computed(() => placed.value.pill)

const verseRows = computed(() => {
  const font = hFont.value || 16
  const ratio = dpr.value || 1
  const snap = (value) => Math.round(value * ratio) / ratio
  const rows = []
  const map = new Map()
  for (const glyph of glyphs.value) {
    if (glyph.role !== 'body') continue
    const key = `${glyph.stanza}-${glyph.line}`
    let row = map.get(key)
    if (!row) {
      row = { key, glyphs: [] }
      map.set(key, row)
      rows.push(row)
    }
    row.glyphs.push(glyph)
  }
  return rows.map((row) => {
    row.glyphs.sort((a, b) => a.index - b.index)
    const text = row.glyphs.map((glyph) => glyph.c).join('')
    if (shown.value === 'v') {
      const left = snap(Math.min(...row.glyphs.map((glyph) => glyph.v.x)))
      const top = snap(Math.min(...row.glyphs.map((glyph) => glyph.v.y)))
      const bottom = snap(Math.max(...row.glyphs.map((glyph) => glyph.v.y + font * glyph.v.scale)))
      const right = snap(left + (vFont.value || font) + 8)
      const width = Math.max(8, right - left)
      const height = Math.max(8, bottom - top)
      return {
        key: row.key,
        text,
        left,
        top,
        width,
        height,
        style: { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` }
      }
    }
    const left = snap(Math.min(...row.glyphs.map((glyph) => glyph.h.x)))
    const top = snap(Math.min(...row.glyphs.map((glyph) => glyph.h.y)))
    const right = snap(Math.max(...row.glyphs.map((glyph) => glyph.h.x + font * glyph.h.scale)))
    const bottom = snap(top + font + 8)
    const width = Math.max(8, right - left)
    const height = Math.max(8, bottom - top)
    return {
      key: row.key,
      text,
      left,
      top,
      width,
      height,
      style: { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` }
    }
  })
})

const hairStyle = computed(() => {
  const px = `${1 / (dpr.value || 1)}px`
  return shown.value === 'v' ? { width: px } : { height: px }
})

const freshPicked = computed(() => verseRows.value.filter((row) => picked.value.includes(row.key) && !lineKept(row.text)))

const keepStyle = computed(() => {
  const rows = freshPicked.value
  if (!rows.length) return { display: 'none' }
  const width = stageW.value || 360
  const top = Math.min(...rows.map((row) => row.top))
  if (shown.value === 'v') {
    const left = Math.min(...rows.map((row) => row.left))
    const right = Math.max(...rows.map((row) => row.left + row.width))
    const center = (left + right) / 2
    const x = Math.max(0, Math.min(center - 21, width - 42))
    return { left: `${x}px`, top: `${top - 50}px` }
  }
  const right = Math.max(...rows.map((row) => row.left + row.width))
  const x = right + 10
  if (x + 42 <= width - 4) return { left: `${x}px`, top: `${top}px` }
  return { left: `${Math.max(4, right - 42)}px`, top: `${Math.max(4, top - 46)}px` }
})

function lineKept(text) {
  return (props.keptLines || []).includes(text)
}

const inkKeys = ref([])
const inkSet = computed(() => new Set(inkKeys.value))
watch(
  () => motion.value || scattered.value,
  (hidden) => {
    if (hidden) {
      inkKeys.value = []
      return
    }
    inkKeys.value = verseRows.value.filter((row) => lineKept(row.text)).map((row) => row.key)
  },
  { immediate: true }
)

function verseStyle(row) {
  const index = inkKeys.value.indexOf(row.key)
  if (index < 0) return row.style
  return { ...row.style, '--ink-delay': `${180 + index * 110}ms` }
}

function onVerseDblClick(row) {
  if (!lineKept(row.text)) return
  picked.value = picked.value.filter((key) => key !== row.key)
  emit('uncollect', row.text)
}

function toggleLine(row) {
  if (lineKept(row.text)) return
  const key = row.key
  picked.value = picked.value.includes(key)
    ? picked.value.filter((item) => item !== key)
    : picked.value.concat(key)
}

function collectPicked() {
  const keys = new Set(freshPicked.value.map((row) => row.key))
  const lines = freshPicked.value.map((row) => row.text).filter(Boolean)
  if (!lines.length) return
  const nodes = cardRef.value ? [...cardRef.value.querySelectorAll('.glyph')] : []
  const shots = []
  const ids = []
  glyphs.value.forEach((glyph, index) => {
    if (glyph.role !== 'body') return
    if (!keys.has(`${glyph.stanza}-${glyph.line}`)) return
    const node = nodes[index]
    if (!node) return
    const box = node.getBoundingClientRect()
    shots.push({ c: glyph.c, x: box.left, y: box.top, size: Math.max(box.height, 12) })
    ids.push(glyph.id)
  })
  suckingIds.value = ids
  clearTimeout(suckTimer)
  suckTimer = window.setTimeout(() => {
    suckingIds.value = []
  }, 920)
  emit('collect', lines, shots)
  picked.value = []
}

watch(
  () => `${props.type}|${props.poemName}|${props.author}|${[].concat(props.content || []).join('\n')}`,
  () => {
    picked.value = []
  }
)

function inkClass(side) {
  if (sealPhase.value === 'out' || sealPhase.value === 'in') {
    if (shown.value !== side) return 'gone'
    return sealPhase.value
  }
  if (!stainLive.value) return shown.value === side ? 'settled' : 'gone'
  return shown.value === side ? 'in' : 'out'
}
const hStain = computed(() => inkClass('h'))
const vStain = computed(() => inkClass('v'))
const cardMotionStyle = computed(() => {
  if (sealPhase.value === 'in') {
    return { '--seal-hold': '1180ms', '--stain-in-delay': '960ms', '--ink-delay': '1240ms' }
  }
  if (sealPhase.value === 'out') {
    return { '--seal-hold': '0ms', '--stain-in-delay': '760ms', '--ink-delay': '1040ms' }
  }
  return { '--seal-hold': '460ms', '--stain-in-delay': '1180ms', '--ink-delay': '1320ms' }
})

function glyphStyle(glyph) {
  const laid = shown.value === 'v' ? glyph.v : glyph.h
  let pos = laid
  const cloud = cloudPos(glyph.id)
  const cloudScale = cloud.scale * (glyph.chen ? 0.9 : 1)
  if (swap.value === 'break' || swap.value === 'fade' || swap.value === 'seed') {
    pos = {
      x: cloud.x,
      y: cloud.y,
      scale: cloudScale * (swap.value === 'break' ? 0.9 : 1),
      opacity: 0
    }
  }
  const scrambling = swap.value === 'break' || swap.value === 'fade' || swap.value === 'seed' || assemble.value
  const stagger = scrambling
    ? Math.round((cloud.x / Math.max(cloudBox.value.w, 1)) * (assemble.value ? 340 : 240))
    : (shown.value === 'v' ? glyph.vDelay : glyph.hDelay)
  const delay = stagger
  const seal = glyph.role === 'by'
  const hold = motion.value && seal && sealPhase.value === 'settled' ? 460 : 0
  let colorDelay = 0
  if (seal && shown.value === 'v') {
    if (sealPhase.value === 'in') colorDelay = 860
    else if (motion.value && stainLive.value) colorDelay = 1320
  }
  const parts = []
  if (motion.value) {
    if (swap.value === 'break') {
      parts.push(`transform 1120ms cubic-bezier(0.33, 0.04, 0.22, 1) ${hold + delay}ms`)
      parts.push(`opacity 1120ms cubic-bezier(0.42, 0.02, 0.72, 0.28) ${hold + delay}ms`)
    } else if (assemble.value) {
      parts.push(`transform 980ms cubic-bezier(0.22, 0.55, 0.24, 1) ${hold + delay}ms`)
      parts.push(`opacity 760ms ease ${hold + delay}ms`)
    } else {
      parts.push(`transform 920ms cubic-bezier(0.4, 0.02, 0.18, 1) ${hold + delay}ms`)
      parts.push(`opacity 460ms ease ${hold + delay}ms`)
    }
  }
  if (seal) parts.push(`color 420ms ease ${colorDelay}ms`)
  const pulled = suckingIds.value.includes(glyph.id)
  if (pulled) parts.push('opacity 180ms ease')
  const sealWhite = shown.value === 'v' && sealPhase.value !== 'out'
  return {
    transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${pos.scale})`,
    opacity: pulled ? 0.05 : pos.opacity,
    color: seal ? (sealWhite ? '#fff' : '#222') : laid.color,
    transition: parts.join(', ') || 'none'
  }
}

const pillStyle = computed(() => {
  if (!pill.value) return { opacity: 0 }
  return {
    transform: `translate3d(${pill.value.x}px, ${pill.value.y}px, 0)`,
    fontSize: `${pill.value.font || 14}px`
  }
})

const vPillStyle = computed(() => {
  const box = pill.value && pill.value.v
  if (!box) return { opacity: 0 }
  return {
    transform: `translate3d(${box.x}px, ${box.y}px, 0)`,
    width: `${box.w}px`,
    height: `${box.h}px`
  }
})

function placeGlyphs({ layout, title, byline, width, hFont, vFont, track, lineFactor }) {
  const glyphs = []
  let longest = 1
  layout.forEach((stanza) => {
    stanza.lines.forEach((line, index) => {
      const extra = stanza.guopian && index === 0 ? 2 : 0
      longest = Math.max(longest, line.chars.length + extra)
    })
  })
  const gaps = Math.max(longest - 1, 1)
  let hStep = hFont * (1 + track)
  if (width >= 800) {
    const target = Math.min(width * 0.78, 760)
    const spread = (target - hFont) / gaps
    const cap = hFont * (track > 0.1 ? 2.05 : 1.42)
    const fitStep = (width * 0.94 - hFont) / gaps
    hStep = Math.min(cap, fitStep, Math.max(hStep, spread))
  }
  const hLine = hFont * lineFactor
  const vStep = vFont * (1 + track)
  const vColGap = vFont * 0.32
  let hOrder = 0
  let y = 0
  layout.forEach((stanza, sidx) => {
    stanza.lines.forEach((line, lidx) => {
      const indent = stanza.guopian && lidx === 0 ? hFont * 2 : 0
      line.chars.forEach((ch, cidx) => {
        glyphs.push({
          id: `b-${sidx}-${lidx}-${cidx}`,
          c: ch.c,
          chen: ch.chen,
          role: 'body',
          h: { x: indent + cidx * hStep, y, scale: ch.chen ? 0.82 : 1, opacity: 1, color: '#222' },
          hOrder: hOrder++,
          stanza: sidx,
          line: lidx,
          index: cidx
        })
      })
      y += hLine
    })
    if (sidx < layout.length - 1) y += hFont * 1.05
  })
  const bodyRight = glyphs.reduce((max, glyph) => Math.max(max, glyph.h.x + hStep), 0)
  const bodyShift = Math.max(0, (width - bodyRight) / 2)
  glyphs.forEach((glyph) => {
    glyph.h.x += bodyShift
  })

  const metaSize = hFont >= 32 ? Math.round(hFont * 0.56) : Math.min(16, hFont)
  const metaScale = metaSize / hFont
  const metaStep = metaSize * 1.06
  const titleChars = Array.from(title)
  const byChars = Array.from(byline)
  const metaCount = titleChars.length + 2 + byChars.length
  const metaGap = metaSize * 0.55
  const metaWidth = metaCount * metaStep + metaGap
  let metaX = Math.max(0, (width - metaWidth) / 2)
  const metaY = y + hFont * 0.45
  const pushMeta = (id, c, role) => {
    glyphs.push({
      id,
      c,
      chen: false,
      role,
      h: {
        x: metaX,
        y: metaY,
        scale: metaScale,
        opacity: role === 'by' ? 0 : 1,
        color: role === 'title' ? '#222' : '#888'
      },
      hOrder: hOrder++
    })
    metaX += metaStep
  }
  pushMeta('mark-open', '《', 'mark')
  titleChars.forEach((c, i) => pushMeta(`t-${i}`, c, 'title'))
  pushMeta('mark-close', '》', 'mark')
  metaX += metaGap
  const byStart = metaX
  byChars.forEach((c, i) => pushMeta(`a-${i}`, c, 'by'))
  const pill = {
    x: byStart - metaSize * 0.35,
    y: metaY - metaSize * 0.12,
    w: byChars.length * metaStep + metaSize * 0.5,
    font: metaSize
  }
  const hHeight = metaY + metaSize + hFont * 0.4

  const body = glyphs.filter((glyph) => glyph.role === 'body')
  const titleGlyphs = glyphs.filter((glyph) => glyph.role === 'title')
  const byGlyphs = glyphs.filter((glyph) => glyph.role === 'by')
  const vColumns = []
  vColumns.push({
    glyphs: titleGlyphs,
    sink: 0,
    step: vFont * 1.18,
    scale: vFont / hFont,
    color: '#222',
    gapAfter: vFont * 0.35
  })
  layout.forEach((stanza, sidx) => {
    stanza.lines.forEach((line, lidx) => {
      const lineGlyphs = body.filter((glyph) => glyph.stanza === sidx && glyph.line === lidx)
      vColumns.push({
        glyphs: lineGlyphs,
        sink: stanza.guopian && lidx === 0 ? vFont * 2 : 0,
        step: vStep,
        scale: vFont / hFont,
        color: '#222',
        gapAfter: lidx === stanza.lines.length - 1 && sidx < layout.length - 1 ? vFont * 0.7 : 0
      })
    })
  })
  vColumns.push({
    glyphs: byGlyphs,
    sink: vFont * 2.4,
    step: vFont * 0.78 * 1.08,
    scale: (vFont * 0.78) / hFont,
    color: '#fff',
    gapAfter: 0
  })

  let vWidth = 0
  vColumns.forEach((column, index) => {
    vWidth += vFont
    if (index < vColumns.length - 1) vWidth += vColGap + column.gapAfter
  })
  let cursor = Math.max(0, (width - vWidth) / 2) + vWidth - vFont
  let vOrder = 0
  vColumns.forEach((column) => {
    column.glyphs.forEach((glyph, index) => {
      const chen = glyph.chen ? 0.82 : 1
      glyph.v = {
        x: cursor,
        y: column.sink + index * column.step,
        scale: column.scale * chen,
        opacity: glyph.role === 'mark' ? 0 : 1,
        color: column.color
      }
      glyph.vOrder = vOrder
      glyph.vDelay = 0
      vOrder += 1
    })
    cursor -= vFont + vColGap + column.gapAfter
  })
  glyphs.forEach((glyph) => {
    if (!glyph.v) {
      glyph.v = { x: glyph.h.x, y: glyph.h.y, scale: glyph.h.scale, opacity: 0, color: '#888' }
      glyph.vOrder = 0
    }
    const count = Math.max(glyphs.length - 1, 1)
    glyph.hDelay = Math.round((glyph.hOrder / count) * 260)
    glyph.vDelay = Math.round((glyph.vOrder / count) * 260)
  })

  let vHeight = 0
  glyphs.forEach((glyph) => {
    vHeight = Math.max(vHeight, glyph.v.y + vFont * 1.15)
  })
  const height = Math.max(hHeight, vHeight) + 8
  const hShift = Math.max(0, (height - hHeight) / 2)
  const vShift = Math.max(0, (height - vHeight) / 2)
  glyphs.forEach((glyph) => {
    glyph.h.y += hShift
    glyph.v.y += vShift
  })
  pill.y += hShift
  const visual = vFont * 0.78
  const padX = Math.max(4, visual * 0.34)
  const padY = Math.max(5, visual * 0.32)
  if (byGlyphs.length && byGlyphs[0].v) {
    const top = byGlyphs[0].v.y
    const left = byGlyphs[0].v.x
    const bottom = byGlyphs[byGlyphs.length - 1].v.y + visual
    pill.v = {
      x: left - padX,
      y: top - padY,
      w: visual + padX * 2,
      h: bottom - top + padY * 2
    }
  }
  return { glyphs, height, pill }
}

</script>

<style scoped>
.poem-card {
  width: min(100%, 960px);
  position: relative;
  z-index: 1;
  cursor: default;
}
.stage {
  position: relative;
  width: 100%;
  font-family: 'SongTi', 'Songti SC', 'STSong', 'SimSun', serif;
  user-select: text;
}
.verses {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}
.verse,
.keep {
  position: absolute;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  font: inherit;
  color: #e16c6c;
  pointer-events: auto;
  cursor: pointer;
}
.verse {
  display: block;
}
.verse:hover,
.verse:focus,
.verse:focus-visible {
  border-color: transparent;
  outline: none;
  background: transparent;
}
.keep:hover,
.keep:focus,
.keep:focus-visible {
  outline: none;
  border: none;
  background: transparent;
  color: #e16c6c;
}
.verse-line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  border-radius: 0;
  background: #e16c6c;
  transform: scaleX(0.15);
  transform-origin: left center;
  opacity: 0;
  transition: transform 0.22s ease, opacity 0.22s ease;
}
.verse:hover .verse-line,
.verse.on .verse-line {
  transform: scaleX(1);
  opacity: 1;
}
.verse.kept .verse-line {
  opacity: 1;
  transform: scaleX(1);
}
.verse.ink.kept .verse-line {
  animation: ink-line-h 960ms cubic-bezier(0.22, 0.61, 0.2, 1) var(--ink-delay, 180ms) both;
}
@keyframes ink-line-h {
  0% { opacity: 0; transform: scaleX(0); }
  20% { opacity: 1; }
  100% { opacity: 1; transform: scaleX(1); }
}
.verse.v .verse-line {
  left: auto;
  right: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  height: auto;
  transform: scaleY(0.15);
  transform-origin: center top;
}
.verse.v:hover .verse-line,
.verse.v.on .verse-line {
  transform: scaleY(1);
}
.verse.v.kept .verse-line {
  transform: scaleY(1);
}
.verse.v.ink.kept .verse-line {
  animation-name: ink-line-v;
}
@keyframes ink-line-v {
  0% { opacity: 0; transform: scaleY(0); }
  20% { opacity: 1; }
  100% { opacity: 1; transform: scaleY(1); }
}
.keep {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  animation: keep-in 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.keep svg {
  transform-origin: 50% 96%;
  animation: gourd-ready 1.8s ease-in-out infinite;
}
@keyframes keep-in {
  from { opacity: 0; transform: translateY(6px) scale(0.86); }
  to { opacity: 1; transform: none; }
}
@keyframes gourd-ready {
  0%, 100% { transform: rotate(-14deg); }
  50% { transform: rotate(14deg); }
}
.glyph {
  position: absolute;
  left: 0;
  top: 0;
  width: 1em;
  height: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transform-origin: 0 0;
  will-change: transform, opacity;
  z-index: 1;
}
.author-tag {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 0;
  background: transparent;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 14px;
  line-height: 1.4;
  letter-spacing: 0;
  white-space: nowrap;
  font-family: 'SongTi', 'Songti SC', 'STSong', 'SimSun', serif;
  pointer-events: none;
}
.author-tag-v {
  padding: 0;
  border-radius: 8px;
}
.author-ink {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: #e16c6c;
  pointer-events: none;
  transform-origin: center center;
}
.author-ink.settled {
  opacity: 1;
  transform: scale(1);
  filter: none;
}
.author-ink.gone {
  opacity: 0;
  transform: translateY(-12px) rotate(7deg) scale(1.08);
  filter: none;
}
.author-ink.in {
  animation: stamp-in 420ms linear var(--stain-in-delay, 1180ms) both;
}
.author-ink.out {
  animation: stamp-out 460ms linear both;
}
.author-words {
  position: relative;
  z-index: 1;
  color: #222;
  opacity: 0;
  transition: color 160ms ease, opacity 340ms ease var(--seal-hold, 0ms);
}
.author-words.on {
  opacity: 1;
  color: #fff;
  transition: opacity 400ms ease var(--seal-hold, 0ms), color 420ms ease var(--ink-delay, 0ms);
}
@keyframes stamp-in {
  0% {
    opacity: 0;
    transform: translateY(-14px) rotate(-8deg) scale(1.22);
  }
  62% {
    opacity: 1;
    transform: translateY(1px) rotate(1.6deg) scale(0.94);
  }
  82% {
    opacity: 1;
    transform: translateY(0) rotate(-0.5deg) scale(1.03);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(0deg) scale(1);
  }
}
@keyframes stamp-out {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg) scale(1);
  }
  32% {
    opacity: 1;
    transform: translateY(1px) rotate(-1.2deg) scale(0.94);
  }
  100% {
    opacity: 0;
    transform: translateY(-12px) rotate(7deg) scale(1.08);
  }
}
@media (prefers-reduced-motion: reduce) {
  .glyph,
  .author-tag,
  .author-words,
  .verse-line,
  .keep,
  .keep svg {
    transition: none !important;
    animation: none;
  }
  .author-ink.in,
  .author-ink.out {
    animation: none;
  }
  .author-ink.in,
  .author-ink.settled {
    opacity: 1;
    transform: none;
    filter: none;
  }
  .author-ink.out,
  .author-ink.gone {
    opacity: 0;
  }
}
</style>
