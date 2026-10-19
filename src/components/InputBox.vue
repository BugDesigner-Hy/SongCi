<template>
  <div class="input-box">
    <div class="type-row">
      <label>类型：</label>
      <select v-model="inputType">
        <option value="唐诗">唐诗</option>
        <option value="宋词">宋词</option>
      </select>
    </div>
    <input v-model="inputDynasty" placeholder="请输入朝代" />
    <input v-model="inputPoemName" placeholder="请输入诗名" />
    <input v-model="inputAuthor" placeholder="请输入作者" />
    <textarea v-model="inputContent" placeholder="请输入古诗或宋词内容（每行一句）" rows="4"></textarea>
    <button @click="onShow">展示</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['show'])
const inputType = ref('唐诗')
const inputDynasty = ref('')
const inputPoemName = ref('')
const inputAuthor = ref('')
const inputContent = ref('')
function onShow() {
  emit('show', {
    type: inputType.value,
    dynasty: inputDynasty.value,
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
  align-items: center;
  margin: 24px 0;
}
.type-row {
  width: 90vw;
  max-width: 400px;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.type-row label {
  font-size: 16px;
  margin-right: 8px;
}
.type-row select {
  font-size: 16px;
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid #bcd;
  font-family: 'SongTi', serif;
}
input, textarea {
  width: 90vw;
  max-width: 400px;
  font-size: 18px;
  border-radius: 8px;
  border: 1px solid #bcd;
  padding: 10px;
  font-family: 'SongTi', serif;
  margin-bottom: 12px;
  box-sizing: border-box;
}
button {
  background: #6CA6CD;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 24px;
  font-size: 18px;
  cursor: pointer;
}
</style> 