<template>
  <div class="home" ref="captureRef">
    <button class="save-btn" @click="saveAsImage" :style="{ background: 'transparent' }">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5v10m0 0l-4-4m4 4l4-4" stroke="#bbb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="6" y="17" width="12" height="2" rx="1" fill="#bbb"/>
      </svg>
    </button>
    <div class="center-wrap">
      <PoemCard
        :dynasty="state.dynasty"
        :content="state.content"
        :poemName="state.poemName"
        :author="state.author"
        :type="state.type"
        @dblclick-content="showInput = true"
        @click-content="showInput = true"
      />
    </div>
    <WaveBg :waveColors="waveColors" />
    <div v-if="showInput" class="modal-mask" @click.self="showInput = false">
      <div class="modal-content">
        <InputBox @show="onInputShow" />
      </div>
    </div>
  </div>
</template>

<script setup>
import html2canvas from 'html2canvas'
import { ref, reactive, onMounted, nextTick } from 'vue'
import PoemCard from '../components/PoemCard.vue'
import WaveBg from '../components/WaveBg.vue'
import InputBox from '../components/InputBox.vue'

const captureRef = ref(null)

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
    link.download = 'poem-card.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  })
}

const showInput = ref(false)
const state = reactive({
  type: '唐诗',
  dynasty: '唐代',
  content: ['红豆生南国，', '春来发几枝。'],
  poemName: '相思',
  author: '王维'
})
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
}
// 禁止页面滚动
onMounted(() => {
  document.body.style.overflow = 'hidden'
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
.save-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 20;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  padding: 0;
  background: transparent;
  transition: background 0.3s;
}
.save-btn svg {
  width: 24px;
  height: 24px;
}
.save-btn:active {
  filter: brightness(0.95);
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
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 32px 18px 18px 18px;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 4px 24px #0002;
}
</style> 