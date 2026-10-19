<template>
  <div class="poem-card">
    <div class="poem-title"></div>
    <div :class="['poem-content', type === '宋词' ? 'songci' : '', type === '唐诗' ? 'poem-tang' : '', songciAutoSmall ? 'auto-small' : '']"
         @click.stop="onClickContent"
         :style="{ marginTop: '100px', fontSize: songciFontSize }">
      <template v-if="type === '宋词'">
        <template v-for="(paragraph, pidx) in songciParagraphs" :key="pidx">
          <div class="songci-paragraph">
            <div v-for="(line, idx) in paragraph" :key="idx">
              <span v-if="line.trim() === ''">&nbsp;</span>
              <span v-else>{{ line }}</span>
            </div>
          </div>
        </template>
      </template>
      <template v-else>
        <div v-for="line in content" :key="line">{{ line }}</div>
      </template>
    </div>
    <div class="poem-author">
      《{{ poemName }}》<span class="author-tag">{{ dynastyShort }} · {{ author }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps(['dynasty', 'content', 'poemName', 'author', 'type'])
const emit = defineEmits(['dblclick-content'])
function onClickContent(e) {
  emit('dblclick-content')
}
// 朝代简称处理
const dynastyShort = computed(() => {
  if (!props.dynasty) return ''
  // 常见朝代简称
  if (props.dynasty.includes('唐')) return '唐'
  if (props.dynasty.includes('宋')) return '宋'
  if (props.dynasty.includes('元')) return '元'
  if (props.dynasty.includes('明')) return '明'
  if (props.dynasty.includes('清')) return '清'
  if (props.dynasty.includes('晋')) return '晋'
  if (props.dynasty.includes('汉')) return '汉'
  if (props.dynasty.includes('魏')) return '魏'
  if (props.dynasty.includes('隋')) return '隋'
  if (props.dynasty.includes('周')) return '周'
  if (props.dynasty.includes('秦')) return '秦'
  return props.dynasty.replace(/代$/, '')
})
// 宋词自适应字体
const songciFontSize = computed(() => {
  if (props.type !== '宋词') return ''
  const lineCount = props.content.length
  if (lineCount > 12) return '16px'
  if (lineCount > 8) return '18px'
  if (lineCount > 5) return '20px'
  return '22px'
})
const songciAutoSmall = computed(() => {
  if (props.type !== '宋词') return false
  // 设定最大字数阈值（30）
  const totalLen = props.content.reduce((sum, line) => sum + line.length, 0)
  return totalLen > 30
})
// 宋词分段（空行分段）
const songciParagraphs = computed(() => {
  if (props.type !== '宋词') return []
  const paras = []
  let para = []
  for (const line of props.content) {
    if (line.trim() === '') {
      if (para.length) paras.push(para)
      para = []
    } else {
      para.push(line)
    }
  }
  if (para.length) paras.push(para)
  return paras
})
</script>

<style scoped>
.poem-card {
  text-align: center;
  margin-top: 60px;
  margin-bottom: 120px;
  z-index: 1;
  position: relative;
}
.poem-title {
  font-size: 22px;
  color: #333;
  margin-bottom: 16px;
}
.poem-content {
  font-family: 'SongTi', serif;
  font-size: 32px;
  color: #222;
  line-height: 1.6;
  margin-bottom: 18px;
  letter-spacing: 2px;
  user-select: text;
  padding-left: 32px;
  padding-right: 32px;
}
.poem-content.songci {
  font-size: 20px;
  text-align: left;
  max-width: 340px;
  width: 100%;
  margin: 0 auto 18px auto;
  line-height: 1.7;
  letter-spacing: 1px;
  white-space: pre-line;
  word-break: break-all;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 32px;
  padding-right: 32px;
}
.poem-content.songci.auto-small {
  font-size: 16px !important;
}
.poem-content.songci div {
  margin-bottom: 4px;
}
.poem-content.songci .songci-paragraph {
  margin-bottom: 18px;
  display: block;
}
.poem-author {
  font-size: 16px;
  color: #888;
  margin-top: 8px;
}
.author-tag {
  background: #e16c6c;
  color: #fff;
  border-radius: 6px;
  padding: 2px 8px;
  margin-left: 4px;
  font-size: 14px;
}
.poem-content.poem-tang {
  padding-left: 32px;
  padding-right: 32px;
  display: inline-block;
}
</style> 