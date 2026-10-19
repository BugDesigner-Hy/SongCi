/** 诗、词、曲的句读与分片。横竖排都吃这份结果。 */

const GONG_RE = /^(?:黄钟|正宫|仙吕调|仙吕|南吕宫|南吕|中吕调|中吕|大石调|大石|小石调|小石|般涉调|般涉|商角调|商角|商调|双调|越调)[・·\s]*/

const QU_TUNES = [
  '天净沙', '山坡羊', '沉醉东风', '水仙子', '折桂令', '四块玉', '凭栏人', '凭阑人',
  '清江引', '落梅风', '拨不断', '喜春来', '寨儿令', '夜行船', '寿阳曲', '卖花声',
  '红绣鞋', '普天乐', '满庭芳', '醉太平', '殿前欢', '庆东原', '得胜令', '雁儿落',
  '小桃红', '一半儿', '金字经', '朝天子', '小梁州', '赏花时', '青杏子', '粉蝶儿',
  '一枝花', '集贤宾', '新水令', '行香子', '乔牌儿', '耍孩儿', '寄生草', '醉中天',
  '黑漆弩', '蟾宫曲', '骂玉郎', '感皇恩', '采茶歌', '凌波仙', '阅金经', '红锦袍',
  '水龙吟', '齐天乐', '哨遍'
].sort((a, b) => b.length - a.length)

/** 单调不再分片 */
const MONO = ['十六字令', '闲中好', '忆王孙', '调笑令', '醉妆词', '甘州曲', '回波乐', '忆江南', '望江南', '梦江南', '江南好', '渔歌子', '捣练子', '潇湘神', '章台柳']
/** 三叠、四叠 */
const TRIPLE = ['兰陵王', '夜半乐', '宝鼎现', '戚氏', '瑞龙吟', '西河']
const QUAD = ['莺啼序']

export function hanCount(text) {
  return (String(text).match(/[\u4e00-\u9fff]/g) || []).length
}

/** 去掉乐府卷次、杂剧本数、组诗序号，留下通行的题名。 */
export function cleanCatalog(title) {
  let text = String(title || '').trim().replace(/・/g, '·')
  if (!text) return ''
  text = text.replace(/^(?:鼓吹曲辞|横吹曲辞|杂曲歌辞|相和歌辞|琴曲歌辞|近代曲辞|清商曲辞|舞曲歌辞|郊庙歌辞|燕射歌辞)\s+/, '')
  text = text.replace(/[（(]第[0-9一二三四五六七八九十百千]+本[）)]/g, '')
  text = text.replace(/^[\u4e00-\u9fff]{2,6}集\s+/, '')
  text = text.replace(/[一二三四五六七八九十百千0-9]+首/g, '')
  text = text.replace(/(?:[·\s]+)其?[一二三四五六七八九十百千]+$/, '')
  text = text.replace(/(?:黄钟|正宫|仙吕调|仙吕|南吕宫|南吕|中吕调|中吕|大石调|大石|小石调|小石|般涉调|般涉|商角调|商角|商调|双调|越调)\//g, '')
  text = text.replace(/\s+/g, ' ').trim().replace(/ +/g, '·')
  text = text.replace(/·+/g, '·').replace(/^·|·$/g, '')
  if (text === '清平调词') text = '清平调'
  return text
}

export function displayTitle(type, title) {
  const raw = String(title || '').trim()
  if (!raw) {
    if (type === '元曲') return '小令'
    if (type === '宋词') return '无题'
    return '无题'
  }
  const named = cleanCatalog(raw) || raw
  if (type !== '元曲') return named
  let rest = named.replace(GONG_RE, '').replace(/^[/／]+/, '')
  for (const tune of QU_TUNES) {
    if (rest.startsWith(tune)) {
      const sub = rest.slice(tune.length).replace(/^[・·\s]+/, '')
      return sub ? `${tune}·${sub}` : tune
    }
  }
  return (rest || raw).replace(/・/g, '·')
}

function tokenize(line) {
  const re = /[（(]([^）)]{1,8})[）)]/g
  const tokens = []
  let last = 0
  let match
  while ((match = re.exec(line))) {
    const inner = match[1]
    const stage = /云|唱|白|科|旦|末/.test(inner)
    if (match.index > last) tokens.push({ t: line.slice(last, match.index), chen: false })
    if (!stage) tokens.push({ t: inner, chen: true })
    last = match.index + match[0].length
  }
  if (last < line.length) tokens.push({ t: line.slice(last), chen: false })
  return tokens.filter((token) => token.t)
}

function splitShiLine(line) {
  const chunks = line.split(/(?<=[，；])/)
  if (chunks.length === 2) {
    const left = hanCount(chunks[0])
    const right = hanCount(chunks[1])
    if (left >= 4 && left <= 7 && left === right) return chunks
  }
  if (hanCount(line) > 16) return splitOnStops(line)
  return [line]
}

function splitOnStops(line) {
  const parts = line.split(/(?<=[。！？；])/).map((part) => part.trim()).filter(Boolean)
  return parts.length ? parts : [line]
}

function splitCiLine(line) {
  if (hanCount(line) <= 28) return [line]
  const out = []
  for (const sentence of splitOnStops(line)) {
    if (hanCount(sentence) <= 28) out.push(sentence)
    else out.push(...packClauses(sentence, 14))
  }
  return out.length ? out : [line]
}

function packClauses(line, limit) {
  const bits = line.split(/(?<=[，、])/)
  const out = []
  let buf = ''
  for (const bit of bits) {
    if (!bit) continue
    if (buf && hanCount(buf + bit) > limit) {
      out.push(buf)
      buf = bit
    } else {
      buf += bit
    }
  }
  if (buf) out.push(buf)
  return out
}

/** 曲是短句，逗号通常就是一句。一两字的顿读并进下一句，避免「兴」单独成行。 */
function splitQuLine(line) {
  const bits = line.split(/(?<=[，。！？；、])/).filter(Boolean)
  const merged = []
  for (const bit of bits) {
    if (merged.length && hanCount(merged[merged.length - 1]) <= 2) merged[merged.length - 1] += bit
    else merged.push(bit)
  }
  if (merged.length >= 2 && hanCount(merged[merged.length - 1]) <= 2) {
    const last = merged.pop()
    merged[merged.length - 1] += last
  }
  return merged.length ? merged : [line]
}

function splitBalanced(lines, parts) {
  const n = lines.length
  if (parts <= 1 || n < parts) return [lines]
  const lens = lines.map(hanCount)
  const prefix = [0]
  for (const len of lens) prefix.push(prefix[prefix.length - 1] + len)
  const seg = (from, to) => prefix[to] - prefix[from]
  const target = prefix[n] / parts
  let best = null
  const cuts = []
  function walk(start, left) {
    if (left === 1) {
      const groups = cuts.concat([[start, n]])
      const sizes = groups.map(([from, to]) => seg(from, to))
      let score = sizes.reduce((sum, size) => sum + (size - target) ** 2, 0)
      for (const [from, to] of groups) if (to - from < 2) score += 800
      if (!best || score < best.score) best = { score, groups }
      return
    }
    for (let i = start + 1; i <= n - (left - 1); i++) {
      cuts.push([start, i])
      walk(i, left - 1)
      cuts.pop()
    }
  }
  walk(0, parts)
  return best.groups.map(([from, to]) => lines.slice(from, to))
}

function splitCi(lines, title) {
  const name = String(title || '').split(/[・·]/)[0]
  if (MONO.some((tune) => name.includes(tune))) return [lines]
  if (lines.length < 4) return [lines]
  let parts = 2
  if (QUAD.some((tune) => name.includes(tune))) parts = 4
  else if (TRIPLE.some((tune) => name.includes(tune))) parts = 3
  if (lines.length < parts * 2) parts = Math.max(1, Math.floor(lines.length / 2))
  if (parts <= 1) return [lines]
  if ((parts === 3 || parts === 4) && lines.length % parts === 0) {
    const size = lines.length / parts
    const groups = []
    for (let i = 0; i < parts; i++) groups.push(lines.slice(i * size, (i + 1) * size))
    return groups
  }
  return splitBalanced(lines, parts)
}

function chunksFromMarks(marked) {
  const chunks = []
  let current = []
  for (const item of marked) {
    if (item == null) {
      if (current.length) chunks.push(current)
      current = []
    } else {
      current.push(item)
    }
  }
  if (current.length) chunks.push(current)
  return chunks
}

export function layoutPoem(type, content, title) {
  const kind = type === '宋词' ? 'ci' : type === '元曲' ? 'qu' : 'shi'
  const raw = Array.isArray(content) ? content : String(content || '').split('\n')
  const marked = []
  for (const row of raw) {
    const line = String(row || '').replace(/\s+/g, '')
    if (!line) {
      marked.push(null)
      continue
    }
    const pieces = kind === 'shi' ? splitShiLine(line) : kind === 'qu' ? splitQuLine(line) : splitCiLine(line)
    for (const piece of pieces) {
      if (hanCount(piece)) marked.push(piece)
    }
  }
  const chunks = chunksFromMarks(marked)
  let groups
  if (kind === 'shi') groups = [chunks.flat()]
  else if (chunks.length > 1) groups = chunks
  else if (kind === 'qu' && /带过/.test(title || '')) groups = splitBalanced(chunks[0] || [], 2)
  else if (kind === 'qu') groups = [chunks[0] || []]
  else groups = splitCi(chunks[0] || [], title)

  return groups
    .filter((lines) => lines.length)
    .map((lines, index) => ({
      guopian: kind !== 'shi' && index > 0,
      lines: lines.map((text) => ({ text, tokens: tokenize(text) }))
    }))
}
