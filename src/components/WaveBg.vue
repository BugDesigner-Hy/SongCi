<template>
  <div class="wave-root">
    <div class="wave-bg-outer" @click="handleClick">
      <svg class="wave-bg" :viewBox="`0 0 1440 ${svgHeight}`" preserveAspectRatio="none">
        <path v-for="(d, i) in wavePaths" :key="i" :d="d" :fill="computedColors[i]" fill-opacity="1" />
      </svg>
    </div>
    <aside class="color-slip" :class="{ on: slipOn }" :aria-hidden="!slipOn" :aria-label="'当前主色' + currentName">
      <span class="slip-wash" :style="{ backgroundColor: currentColor }"></span>
      <span class="slip-name">
        <Transition name="slip-ink" mode="out-in">
          <span :key="currentName" class="slip-chars">
            <span v-for="(ch, index) in currentChars" :key="currentName + index">{{ ch }}</span>
          </span>
        </Transition>
      </span>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
const props = defineProps({
  waveColors: { type: Array, default: () => ['#6CA6CD', '#5B8DB8', '#4A729B', '#B0D5DF', '#A3C1DA'] }
})
const STEP_MS = 14000
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
let rafId = 0
let origin = 0
let glide = null
let slipTimer = 0
const palettePos = ref(0)
const gliding = ref(false)
const holdSlip = ref(false)

const wavePaths = ref([])
const waveCount = 5
const svgHeight = 420

// 中国传统色，按色相排开，波浪只在这些颜色之间渐变
const colorNames = ['天青', '天水碧', '竹青', '缃色', '杏黄', '藕色', '雪青', '群青']
const chineseColors = [
  '#6CA6CD',
  '#5AA8A4',
  '#789262',
  '#C6A15B',
  '#E0B090',
  '#D4A0A0',
  '#B0A4C8',
  '#7E8CB5'
]

function hexToRgb(hex) {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('')
  const num = parseInt(hex, 16)
  return [num >> 16, (num >> 8) & 0xff, num & 0xff]
}
function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}
function mixColor(rgb, percent) {
  return rgb.map(x => Math.round(x + (255 - x) * percent))
}
function hexToHsl(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [200, 0, l * 100]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return [h * 60, s * 100, l * 100]
}
function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360
  s /= 100
  l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return rgbToHex([(r + m) * 255, (g + m) * 255, (b + m) * 255].map((v) => Math.round(v)))
}
const paletteHsl = chineseColors.map((hex) => hexToHsl(hex))

function lerpHsl(from, to, t) {
  const dh = ((to[0] - from[0] + 540) % 360) - 180
  return [
    (from[0] + dh * t + 360) % 360,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t
  ]
}
function samplePalette(at) {
  const count = paletteHsl.length
  const x = ((at % count) + count) % count
  const index = Math.floor(x)
  const next = (index + 1) % count
  return lerpHsl(paletteHsl[index], paletteHsl[next], x - index)
}
function clockPos(now) {
  if (!origin) origin = now
  if (!glide) return (now - origin) / STEP_MS
  const p = Math.min(1, (now - glide.start) / glide.duration)
  const eased = 1 - (1 - p) ** 3
  const value = glide.from + (glide.to - glide.from) * eased
  if (p >= 1) {
    origin = now - value * STEP_MS
    glide = null
    gliding.value = false
    holdSlip.value = true
    clearTimeout(slipTimer)
    slipTimer = window.setTimeout(() => {
      holdSlip.value = false
    }, 1300)
  }
  return value
}
function glideToIndex(index, duration) {
  const now = performance.now()
  const from = clockPos(now)
  let to = index
  while (to < from) to += paletteHsl.length
  if (to - from < 0.2) to += paletteHsl.length
  if (!duration) {
    origin = now - to * STEP_MS
    glide = null
    palettePos.value = to
    return
  }
  gliding.value = true
  holdSlip.value = false
  clearTimeout(slipTimer)
  glide = { from, to, start: now, duration }
}
function stepColor(now) {
  if (reduceMotion) return
  palettePos.value = clockPos(now)
}
const mainIndex = computed(() => {
  const count = chineseColors.length
  const at = (reduceMotion ? 0 : palettePos.value) + 0.85
  const x = ((at % count) + count) % count
  return Math.round(x) % count
})
const currentName = computed(() => colorNames[mainIndex.value])
const currentColor = computed(() => chineseColors[mainIndex.value])
const currentChars = computed(() => Array.from(currentName.value))
const crossing = computed(() => {
  const count = chineseColors.length
  const at = (reduceMotion ? 0 : palettePos.value) + 0.85
  const x = ((at % count) + count) % count
  const frac = x - Math.floor(x)
  return frac >= 0.38 && frac < 0.66
})
const slipOn = computed(() => gliding.value || holdSlip.value || crossing.value)
const computedColors = computed(() => {
  const at = reduceMotion ? 0 : palettePos.value
  return Array.from({ length: waveCount }, (_, i) => {
    const along = at + (i / Math.max(waveCount - 1, 1)) * 0.85
    const [h, s, l] = samplePalette(along)
    const white = (waveCount - 1 - i) / (waveCount * 1.25)
    return rgbToHex(mixColor(hexToRgb(hslToHex(h, s, l)), white))
  })
})
const mainInk = computed(() => computedColors.value[waveCount - 1] || chineseColors[0])
watch(mainInk, (hex) => {
  document.documentElement.style.setProperty('--yanbian-ink', hex)
}, { immediate: true })

function getWavePath(t = 0, amp = 28, base = 260, freq = 1, phase = 0) {
  let path = `M0,${base} `;
  for (let x = 0; x <= 1440; x += 40) {
    let y = base + amp * Math.sin(freq * (x / 900) * Math.PI + t + phase);
    path += `L${x},${y} `;
  }
  path += `L1440,${svgHeight} L0,${svgHeight} Z`;
  return path;
}
function animate() {
  let t = 0;
  function frame() {
    const arr = []
    for (let i = 0; i < waveCount; i++) {
      arr.push(getWavePath(
        t * (0.4 + i * 0.03),
        28 - i * 4, // 振幅小且递减
        260 + i * 24, // 基线更接近，间距更小
        0.7 + i * 0.05,
        i * 1.2
      ))
    }
    wavePaths.value = arr
    stepColor(performance.now())
    t += 0.012
    rafId = requestAnimationFrame(frame)
  }
  rafId = requestAnimationFrame(frame)
}
function handleClick() {
  const index = Math.floor(Math.random() * chineseColors.length)
  glideToIndex(index, reduceMotion ? 0 : 3200)
}
watch(currentName, (name, prev) => {
  if (!reduceMotion || !prev || name === prev) return
  holdSlip.value = true
  clearTimeout(slipTimer)
  slipTimer = window.setTimeout(() => {
    holdSlip.value = false
  }, 2200)
})
watch(() => props.waveColors?.[0], (hex, prev) => {
  if (!hex || hex === prev) return
  const index = chineseColors.findIndex((item) => item.toLowerCase() === String(hex).toLowerCase())
  if (index >= 0) glideToIndex(index, reduceMotion ? 0 : 3200)
})
onMounted(animate)
onUnmounted(() => {
  cancelAnimationFrame(rafId)
  clearTimeout(slipTimer)
  document.documentElement.style.removeProperty('--yanbian-ink')
})
</script>

<style scoped>
.wave-bg-outer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100vw;
  height: 33vh;
  min-height: 320px;
  max-height: 420px;
  z-index: 0;
  overflow: hidden;
  pointer-events: auto;
}
.wave-bg {
  width: 100vw;
  height: 100%;
  display: block;
}
.color-slip {
  position: fixed;
  right: 36px;
  bottom: 72px;
  z-index: 2;
  width: 58px;
  padding: 18px 0 16px;
  pointer-events: none;
  background:
    radial-gradient(90% 46% at 50% 0%, rgba(255, 255, 255, 0.72), transparent 68%),
    linear-gradient(180deg, #fbf6ec, #efe2cc);
  border: 1px solid rgba(92, 62, 38, 0.5);
  border-radius: 2px;
  box-shadow:
    inset 0 0 0 4px rgba(251, 246, 236, 0.96),
    inset 0 0 0 5px rgba(92, 62, 38, 0.38),
    0 12px 24px rgba(72, 48, 24, 0.16);
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.9s ease, transform 0.9s ease;
}
.color-slip.on {
  opacity: 1;
  transform: translateY(0);
  transition-duration: 0.5s;
}
.slip-wash {
  position: absolute;
  inset: 7px;
  opacity: 0.38;
  transition: background-color 1.4s ease;
}
.slip-name {
  position: relative;
  z-index: 1;
  min-height: 5.2em;
  display: flex;
  align-items: center;
  justify-content: center;
}
.slip-chars {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.28em;
  font-family: 'SongTi', serif;
  font-size: 17px;
  line-height: 1;
  color: #3a291c;
}
.slip-ink-enter-active,
.slip-ink-leave-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
}
.slip-ink-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.slip-ink-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
@media (max-width: 640px) {
  .color-slip {
    right: 14px;
    bottom: 28px;
    width: 46px;
  }
  .slip-chars {
    font-size: 15px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .slip-wash,
  .slip-ink-enter-active,
  .slip-ink-leave-active,
  .color-slip {
    transition: none;
  }
}
</style> 