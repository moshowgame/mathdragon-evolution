// 拼音音频预生成脚本（Edge TTS 预编译方案）
// 用法：node tools/gen-pinyin-audio.mjs
// 输出：assets/audio/pinyin/{字母}{声调}.mp3，如 a1.mp3、v3.mp3（ü 用 v 命名）
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { mkdirSync, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const OUT_DIR = 'assets/audio/pinyin';
const VOICE = 'zh-CN-XiaoyiNeural'; // 年轻活泼的童趣音色
const FALLBACK_VOICE = 'zh-CN-XiaoxiaoNeural';

/** 单韵母 × 4 声调（一期）—— i/u/ü 单字符合成不出音频，用呼读音汉字 */
const VOWELS = {
  a: ['ā', 'á', 'ǎ', 'à'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['衣', '姨', '蚁', '亿'],
  u: ['乌', '无', '五', '物'],
  'ü': ['迂', '鱼', '雨', '玉'],
};
/** 字母文件名映射（ü → v，避免文件名问题） */
const NAME = { a: 'a', o: 'o', e: 'e', i: 'i', u: 'u', 'ü': 'v' };

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
for (const [py, tones] of Object.entries(VOWELS)) {
  for (let t = 0; t < 4; t++) {
    const file = `${OUT_DIR}/${NAME[py]}${t + 1}.mp3`;
    const { audioStream } = await tts.toStream(tones[t]);
    await pipeline(Readable.from(audioStream), createWriteStream(file));
    ok++;
    console.log('✓', tones[t], '→', file);
  }
}
await tts.close();
console.log(`done: ${ok} files`);
