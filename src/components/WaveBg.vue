<template>
  <div class="wave-bg-outer" @click="handleClick">
    <svg class="wave-bg" :viewBox="`0 0 1440 ${svgHeight}`" preserveAspectRatio="none">
      <path v-for="(d, i) in wavePaths" :key="i" :d="d" :fill="computedColors[i]" :style="{ transition: 'fill 1s' }" fill-opacity="1" />
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
const props = defineProps({
  waveColors: { type: Array, default: () => ['#6CA6CD', '#5B8DB8', '#4A729B', '#B0D5DF', '#A3C1DA'] }
})
const colors = ref(props.waveColors)
watch(() => props.waveColors, (val) => { colors.value = val }, { immediate: true })

const wavePaths = ref([])
const waveCount = 5
const svgHeight = 420

// 中国传统色（部分，适合做主色）
const chineseColors = [
  '#6CA6CD', '#5B8DB8', '#4A729B', '#B0D5DF', '#A3C1DA', '#A3D2CA', '#7FC8A9', '#5EAAA8',
  '#F6C555', '#F9D77E', '#F6E3B4', '#F7CAC9', '#D4A4A4', '#C48E8E', '#B07B7B', '#E6C3C3', '#EAD7D7',
  '#F9D5A2', '#F9E4B7', '#B5D6E1', '#A3C1DA', '#B8E0D2', '#C7EDCC', '#F7CAC9', '#F6E3B4'
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
const computedColors = computed(() => {
  const base = hexToRgb(colors.value[0])
  return Array.from({ length: waveCount }, (_, i) => {
    const p = (waveCount - 1 - i) / (waveCount * 1.2)
    return rgbToHex(mixColor(base, p))
  })
})

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
    t += 0.012
    requestAnimationFrame(frame)
  }
  frame()
}
function handleClick() {
  // 随机选一个主色
  const mainColor = chineseColors[Math.floor(Math.random() * chineseColors.length)]
  colors.value = [mainColor]
}
onMounted(animate)
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
</style> 