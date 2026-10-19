import { reactive, ref } from 'vue'

// 词库有三 MB 左右，打进主包会让首屏白白多等两秒，因此放到 public/data 下运行时拉取。
// 首次需要时会自动请求，之后都走同一份缓存。
export const library = reactive({ shi: [], ci: [], qu: [] })
export const loaded = ref(false)
export const failed = ref(false)

let pending = null

export function loadLibrary() {
  if (pending) return pending
  const url = `${import.meta.env.BASE_URL}data/library.json`
  pending = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`词库请求失败：${res.status}`)
      return res.json()
    })
    .then((data) => {
      Object.assign(library, data)
      loaded.value = true
      return library
    })
    .catch((err) => {
      failed.value = true
      pending = null
      throw err
    })
  return pending
}
