<template>
  <div class="input-box">
    <div class="type-row" role="tablist" aria-label="诗词分类">
      <span class="type-thumb" :class="'at-' + tabIndex"></span>
      <button
        v-for="item in types"
        :key="item"
        type="button"
        role="tab"
        :aria-selected="inputType === item"
        :class="{ on: inputType === item }"
        @click="selectType(item)"
      >{{ item }}</button>
    </div>
    <input ref="searchRef" v-model="keyword" :placeholder="placeholder" />
    <div class="hits-stage">
      <Transition :name="slideName">
        <div class="hits" :key="inputType" @scroll.passive="onHitsScroll">
          <TransitionGroup name="result" tag="div" class="hit-list">
            <button
              v-for="(item, index) in results"
              :key="item.key"
              type="button"
              class="hit"
              :style="{ '--i': Math.min(index, 6) }"
              @click="pick(item)"
            >
              <span class="hit-title">{{ displayTitle(inputType, item.t) }}</span>
              <span class="hit-author">{{ item.a }}</span>
              <span class="hit-line">{{ item.p[0] }}</span>
            </button>
            <p v-if="!matched.length" key="empty" class="empty">词库里没有这句，可以在下面自己写。</p>
          </TransitionGroup>
          <p v-if="results.length < matched.length" class="more">继续下拉，还有 {{ matched.length - results.length }} 首</p>
        </div>
      </Transition>
    </div>
    <p class="credit">选自开源文集 chinese-poetry：唐诗三百首、宋词三百首，元曲可一直往下翻</p>
    <button type="button" class="ghost" @click="manual = !manual">{{ manual ? '收起手写' : '没有想要的，自己写' }}</button>
    <template v-if="manual">
      <input v-model="inputDynasty" placeholder="朝代" />
      <input v-model="inputPoemName" :placeholder="namePlaceholder" />
      <input v-model="inputAuthor" placeholder="作者" />
      <textarea v-model="inputContent" placeholder="一句一行。宋词想自己分片，片与片之间空一行。" rows="5"></textarea>
      <button type="button" class="primary" @click="onShow">展示</button>
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import library from '../data/library.json'
import { displayTitle } from '../utils/typeset.js'

const props = defineProps({
  type: { type: String, default: '唐诗' }
})
const emit = defineEmits(['show'])

const types = ['唐诗', '宋词', '元曲']
const inputType = ref(types.includes(props.type) ? props.type : '唐诗')
const keyword = ref('')
const searchRef = ref(null)
const slideName = ref('pane-forward')
const tabIndex = computed(() => Math.max(0, types.indexOf(inputType.value)))

onMounted(() => {
  if (window.matchMedia('(pointer: fine)').matches) searchRef.value?.focus()
})

function selectType(item) {
  const next = types.indexOf(item)
  if (next === tabIndex.value) return
  slideName.value = next > tabIndex.value ? 'pane-forward' : 'pane-back'
  inputType.value = item
}
const manual = ref(false)
const inputDynasty = ref('')
const inputPoemName = ref('')
const inputAuthor = ref('')
const inputContent = ref('')

const poolKey = computed(() => ({ 唐诗: 'shi', 宋词: 'ci', 元曲: 'qu' }[inputType.value]))
const placeholder = computed(() => {
  if (inputType.value === '宋词') return '搜词牌、作者或一句词'
  if (inputType.value === '元曲') return '搜曲牌、作者或一句曲'
  return '搜诗题、作者或一句诗'
})
const namePlaceholder = computed(() => (inputType.value === '唐诗' ? '诗题' : '词牌或曲牌'))

const pageSize = 24
const shown = ref(pageSize)

const matched = computed(() => {
  const pool = library[poolKey.value] || []
  const q = keyword.value.trim()
  const hits = []
  for (const item of pool) {
    if (!q || item.a.includes(q) || item.t.includes(q) || item.p.some((line) => line.includes(q))) hits.push(item)
  }
  const seen = new Map()
  return hits.map((item) => {
    const base = `${item.a}|${item.t}|${item.p[0] || ''}`
    const count = (seen.get(base) || 0) + 1
    seen.set(base, count)
    return { ...item, key: count > 1 ? `${base}|${count}` : base }
  })
})

const results = computed(() => matched.value.slice(0, shown.value))

watch(keyword, async () => {
  shown.value = pageSize
  await nextTick()
  const el = document.querySelector('.input-box .hits')
  if (el) el.scrollTop = 0
})

watch(inputType, () => {
  shown.value = pageSize
})

function onHitsScroll(event) {
  const el = event.currentTarget
  if (shown.value >= matched.value.length) return
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) {
    shown.value = Math.min(matched.value.length, shown.value + pageSize)
  }
}

const dynastyOf = { 唐诗: '唐代', 宋词: '宋代', 元曲: '元代' }

function pick(item) {
  emit('show', {
    type: inputType.value,
    dynasty: dynastyOf[inputType.value],
    poemName: item.t,
    author: item.a,
    content: item.p.join('\n')
  })
}

function onShow() {
  emit('show', {
    type: inputType.value,
    dynasty: inputDynasty.value || dynastyOf[inputType.value],
    poemName: inputPoemName.value,
    author: inputAuthor.value,
    content: inputContent.value
  })
}
</script>

<style scoped>
.input-box {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: min(440px, 86vw);
}
.type-row {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  box-sizing: border-box;
  margin-bottom: 12px;
  padding: 4px;
  border-radius: 999px;
  background: #f2f6f8;
}
.type-thumb {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc((100% - 20px) / 3);
  border-radius: 999px;
  background: #6CA6CD;
  pointer-events: none;
  transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}
.type-thumb.at-1 {
  transform: translateX(calc(100% + 6px));
}
.type-thumb.at-2 {
  transform: translateX(calc(200% + 12px));
}
.type-row button,
.ghost,
.primary,
.hit {
  font-family: 'SongTi', serif;
}
.type-row button {
  position: relative;
  z-index: 1;
  border: none;
  background: transparent;
  color: #6d7c86;
  border-radius: 999px;
  padding: 7px 0;
  font-size: 16px;
  transition: color 0.28s ease;
}
.type-row button:hover {
  background: transparent;
  border-color: transparent;
  color: #3e5160;
}
.type-row button.on,
.type-row button.on:hover {
  background: transparent;
  color: #fff;
}
input, textarea {
  width: 100%;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #bcd;
  padding: 10px;
  font-family: 'SongTi', serif;
  margin-bottom: 10px;
  box-sizing: border-box;
  color: #222;
  background: #fff;
}
.hits-stage {
  position: relative;
  margin-bottom: 8px;
  overflow: hidden;
  border: 1px solid #e6eef3;
  border-radius: 10px;
  background: #fff;
}
.hits {
  max-height: 42vh;
  overflow: auto;
  scrollbar-gutter: stable;
  border: none;
  border-radius: 0;
  background: transparent;
}
.hit-list {
  position: relative;
}
.pane-forward-enter-active,
.pane-back-enter-active {
  transition: opacity 0.32s ease, transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}
.pane-forward-leave-active,
.pane-back-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transition: opacity 0.22s ease, transform 0.32s ease;
}
.pane-forward-enter-from,
.pane-back-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
.pane-back-enter-from,
.pane-forward-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
.result-enter-active {
  transition: opacity 0.4s ease, transform 0.46s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i) * 34ms);
}
.result-leave-active {
  position: absolute;
  left: 0;
  right: 0;
  transition: opacity 0.16s ease;
}
.result-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.result-leave-to {
  opacity: 0;
}
.result-move {
  transition: transform 0.36s cubic-bezier(0.22, 1, 0.36, 1);
}
.result-enter-active.result-move {
  transition: opacity 0.4s ease, transform 0.46s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i) * 34ms);
}
.hit {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2px 10px;
  text-align: left;
  background: #fff;
  color: #222;
  border: none;
  border-bottom: 1px solid #f0f3f5;
  border-radius: 0;
  padding: 10px 12px;
}
.hit:last-child {
  border-bottom: none;
}
.hit-title {
  font-size: 16px;
}
.hit-author {
  font-size: 13px;
  color: #e16c6c;
}
.hit-line {
  grid-column: 1 / -1;
  font-size: 13px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.empty,
.more {
  margin: 0;
  padding: 16px 12px;
  color: #888;
  font-size: 14px;
  font-family: 'SongTi', serif;
}
.more {
  text-align: center;
  font-size: 13px;
  color: #a3a3a3;
}
.credit {
  margin: 0 0 8px;
  color: #a3a3a3;
  font-size: 12px;
  line-height: 1.5;
}
.ghost {
  background: transparent;
  color: #6CA6CD;
  border: none;
  padding: 6px 0 10px;
  font-size: 14px;
}
.primary {
  background: #6CA6CD;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 24px;
  font-size: 18px;
  align-self: center;
}
@media (prefers-reduced-motion: reduce) {
  .type-thumb,
  .type-row button,
  .pane-forward-enter-active,
  .pane-back-enter-active,
  .pane-forward-leave-active,
  .pane-back-leave-active,
  .result-enter-active,
  .result-leave-active,
  .result-move,
  .result-enter-active.result-move {
    transition: none;
  }
}
</style>
