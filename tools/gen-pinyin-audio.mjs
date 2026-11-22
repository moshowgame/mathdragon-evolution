// 拼音音频预生成脚本（Edge TTS 预编译方案）· 二期全量
// 用法：node tools/gen-pinyin-audio.mjs
// 输出：assets/audio/pinyin/
//   单韵母（4 声调）：a1~a4.mp3、v1~v4.mp3（ü 用 v）
//   声母/复韵母/鼻韵母/整体认读（单音）：b1.mp3、ai1.mp3、zhi1.mp3…
//   拼读音节：{声母}-{韵母}{调}.mp3，如 b-a4.mp3（爸）、n-v3.mp3（女）
// 每个条目带候选文本（首选带调拼音，回退呼读音汉字），合成 0 字节自动换下一个
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { mkdirSync, createWriteStream, statSync } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const OUT_DIR = 'assets/audio/pinyin';
const VOICE = 'zh-CN-XiaoyiNeural'; // 年轻活泼的童趣音色
const FALLBACK_VOICE = 'zh-CN-XiaoxiaoNeural';

/** 音频清单：键=文件名（不含 .mp3），值=候选文本数组（依序尝试直到合成成功） */
const ITEMS = {
  // ---- 单韵母（4 声调） ----
  a1: ['ā'], a2: ['á'], a3: ['ǎ'], a4: ['à'],
  o1: ['ō'], o2: ['ó'], o3: ['ǒ'], o4: ['ò'],
  e1: ['ē'], e2: ['é'], e3: ['ě'], e4: ['è'],
  i1: ['ī', '衣'], i2: ['í', '姨'], i3: ['ǐ', '蚁'], i4: ['ì', '亿'],
  u1: ['ū', '乌'], u2: ['ú', '无'], u3: ['ǔ', '五'], u4: ['ù', '物'],
  v1: ['ǖ', '迂'], v2: ['ǘ', '鱼'], v3: ['ǚ', '雨'], v4: ['ǜ', '玉'],

  // ---- 声母（呼读音） ----
  b1: ['播'], p1: ['坡'], m1: ['摸'], f1: ['佛'],
  d1: ['得'], t1: ['特'], n1: ['讷', '呐'], l1: ['勒', '乐'],
  g1: ['哥'], k1: ['科'], h1: ['喝'],
  j1: ['鸡'], q1: ['七'], x1: ['西'],
  zh1: ['知'], ch1: ['吃'], sh1: ['狮'], r1: ['日'],
  z1: ['资'], c1: ['刺'], s1: ['丝'], y1: ['医'], w1: ['乌'],

  // ---- 复韵母 ----
  ai1: ['āi', '哀'], ei1: ['ēi', '欸'], ui1: ['wēi', '威'],
  ao1: ['áo', '熬'], ou1: ['ōu', '欧'], iu1: ['iū', '优'],
  ie1: ['iē', '耶'], ve1: ['üē', '约'], er1: ['ěr', '耳'],

  // ---- 鼻韵母 ----
  an1: ['ān', '安'], en1: ['ēn', '恩'], in1: ['īn', '音'],
  un1: ['ūn', '温'], vn1: ['ǖn', '晕'],
  ang1: ['áng', '昂'], eng1: ['ēng', '鞥'], ing1: ['īng', '英'], ong1: ['ōng', '嗡'],

  // ---- 整体认读 ----
  zhi1: ['织'], chi1: ['吃'], shi1: ['狮'], ri1: ['日'],
  zi1: ['资'], ci1: ['刺'], si1: ['丝'],
  yi1: ['衣'], wu1: ['乌'], yu1: ['迂'],
  ye1: ['爷'], yue1: ['月'], yuan1: ['圆'],
  yin1: ['因'], yun1: ['云'], ying1: ['鹰'],

  // ---- 拼读音节（声母 + 韵母 + 声调 → 例字） ----
  'b-a4': ['爸'], 'm-a1': ['妈'], 'd-a4': ['大'], 'h-a3': ['哈'],
  'p-o1': ['坡'], 'm-o1': ['摸'], 'b-o2': ['伯'],
  'g-e1': ['哥'], 'k-e2': ['颗'], 'h-e4': ['贺'], 'd-e2': ['德'],
  'j-i1': ['鸡'], 'q-i2': ['棋'], 'x-i3': ['喜'], 'd-i4': ['地'], 't-i2': ['提'], 'l-i3': ['里'],
  'g-u1': ['姑'], 'h-u2': ['壶'], 't-u3': ['土'], 'd-u4': ['度'], 'k-u4': ['酷'],
  'b-ai2': ['白'], 'p-ai4': ['派'], 'm-ai3': ['买'], 'l-ai2': ['来'],
  'b-ei4': ['贝'], 'p-ei2': ['陪'], 'm-ei4': ['妹'], 'f-ei1': ['飞'],
  'd-ao4': ['到'], 't-ao1': ['涛'], 'n-ao3': ['脑'], 'l-ao4': ['老'], 'g-ao1': ['高'], 'h-ao3': ['好'],
  'g-ou3': ['狗'], 'h-ou4': ['后'], 't-ou2': ['头'], 'd-ou4': ['豆'],
  'n-iu2': ['牛'], 'l-iu4': ['六'], 'q-iu2': ['球'], 'j-iu3': ['酒'],
  'x-ie4': ['谢'], 'j-ie3': ['姐'], 'y-e4': ['夜'],
  'x-ue3': ['雪'], 'y-ue4': ['月'], 'q-ue2': ['缺'],
  'n-v3': ['女'], 'l-v4': ['绿'],
  'sh-an1': ['山'], 's-an3': ['伞'], 'r-an2': ['然'],
  'm-en2': ['门'], 'r-en2': ['人'], 'f-en1': ['分'],
  'j-in1': ['金'], 'x-in1': ['心'], 'q-in2': ['琴'],
  'b-ang1': ['帮'], 'f-ang2': ['房'], 't-ang2': ['糖'], 'l-ang2': ['狼'], 'h-ang2': ['航'],
  'zh-ang1': ['张'], 'sh-ang4': ['上'],
  'd-eng1': ['灯'], 'f-eng1': ['风'], 't-eng2': ['疼'], 'm-eng4': ['梦'],
  'x-ing1': ['星'], 'q-ing2': ['晴'], 'j-ing1': ['京'],
  'zh-ong1': ['中'], 'ch-ong1': ['冲'],
};

mkdirSync(OUT_DIR, { recursive: true });

const tts = new MsEdgeTTS();
let voice = VOICE;
try {
  await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
} catch {
  voice = FALLBACK_VOICE;
  await tts.setMetadata(FALLBACK_VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
}
console.log('voice =', voice);

let ok = 0;
const failed = [];
for (const [name, candidates] of Object.entries(ITEMS)) {
  const file = `${OUT_DIR}/${name}.mp3`;
  let done = false;
  for (const text of candidates) {
    try {
      const { audioStream } = await tts.toStream(text);
      await pipeline(Readable.from(audioStream), createWriteStream(file));
      if (statSync(file).size > 1024) {
        console.log('✓', text, '→', file);
        ok++;
        done = true;
        break;
      }
    } catch { /* 换下一个候选 */ }
  }
  if (!done) failed.push(name);
}
await tts.close();
console.log(`done: ${ok} files${failed.length ? '，FAILED: ' + failed.join(', ') : ''}`);
