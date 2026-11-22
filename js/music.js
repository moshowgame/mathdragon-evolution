// 8-bit 芯片音乐 BGM：方波主旋律 + 三角波贝斯 + 噪声鼓组
// 曲目循环：《上学歌》（曲谱移植）→《种太阳》（听写版）→ 热血进行曲（魂斗罗风原创），三首无缝循环

import { ensureCtx } from './audio.js';

const MUSIC_KEY = 'mathdragon_music';

// ---------- 乐谱 ----------
// 每个 song：bpm（速度）、stepsPerBar（每小节步数：2/4=4，4/4=8，一步=八分音符）
// melody: [音符, 占步数]，null 为休止；bass: 每小节和弦根音

const SONGS = [
  {
    name: '上学歌',
    bpm: 126,
    stepsPerBar: 4,
    // 太阳当空照 花儿对我笑 小鸟说早早早 你为什么背上小书包
    melody: [
      ['C5',1],['D5',1],['E5',1],['C5',1],['G4',4],
      ['G4',1],['G4',1],['C6',1],['G4',1],['G4',4],
      ['G4',1],['G4',1],['C6',2],['G4',1],['G4',1],['E5',2],
      ['G4',1],['G4',1],['E5',1],['G4',1],['E5',1],['C5',1],['D5',1],['E5',1],['C5',4],
    ],
    bass: ['C','C','C','C','C','C','G','G','C'],
  },
  {
    name: '种太阳',
    bpm: 112,
    stepsPerBar: 8,
    // 啦啦啦种太阳 ×2 / 种太阳 / 到那个时候 世界每个角落 都会变得温暖又明亮（听写版，个别音可再调）
    melody: [
      ['G4',1],['G4',1],['A4',2],['C5',2],['A4',1],['G4',1],
      ['G4',1],['G4',1],['A4',2],['C5',2],['A4',1],['G4',1],
      ['G4',1],['G4',1],['A4',1],['G4',1],['C5',1],['A4',1],['C5',1],['A4',1],
      ['C5',2],['A4',2],['G4',4],
      ['E4',1],['E4',1],['G4',1],['E4',1],['A4',1],['G4',1],['E4',1],['G4',1],
      ['A4',1],['G4',1],['E4',1],['G4',1],['A4',2],['C5',1],['A4',1],
      ['E5',1],['C5',1],['A4',1],['G4',1],['E4',1],['D4',1],['E4',1],['D4',1],
      ['C4',4],[null,4],
    ],
    bass: ['C','C','C','C','C','F','G','C'],
  },
  {
    name: '热血进行曲',
    bpm: 160,
    stepsPerBar: 8,
    // 魂斗罗风原创：A 段热血进行 + B 段明亮欢快
    melody: [
      // A 段（热血进行）
      ['E4',1],['E4',1],['G4',1],['A4',1],['B4',2],[null,1],['A4',1],
      ['G4',1],['A4',1],['B4',2],[null,1],['D5',1],['B4',1],['A4',1],
      ['E4',1],['E4',1],['G4',1],['A4',1],['B4',2],[null,1],['E5',1],
      ['B4',1],['A4',1],['G4',1],['E4',1],['E4',2],[null,2],
      // B 段（明亮欢快）
      ['C5',1],[null,1],['C5',1],['B4',1],['A4',1],[null,1],['G4',1],['A4',1],
      ['B4',1],[null,1],['B4',1],['A4',1],['G4',1],[null,1],['E4',1],['G4',1],
      ['A4',1],['A4',1],['G4',1],['A4',1],['B4',2],[null,1],['D5',1],
      ['D5',1],['B4',1],['G4',1],['B4',1],['C5',2],[null,2],
    ],
    bass: ['E','G','E','A','C','G','A','G'],
  },
];

// 和弦根音 → 实际低音 / 五音（三角波贝斯）
const BASS_FIFTH = { C: 'G3', G: 'D4', F: 'C4', E: 'B2', A: 'E3', D: 'A3' };

// ---------- 工具 ----------
const SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function noteFreq(name) {
  const m = /^([A-G])(\d)$/.exec(name);
  const midi = (Number(m[2]) + 1) * 12 + SEMITONES[m[1]];
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** 把音符序列展开为「步数 → {note, dur}」映射，并计算总步数 */
function buildTrack(seq) {
  const map = new Map();
  let step = 0;
  for (const [note, dur] of seq) {
    if (note) map.set(step, { note, dur });
    step += dur;
  }
  return { map, total: step };
}

// 预处理每首曲子
const PREPARED = SONGS.map((song) => {
  const { map, total } = buildTrack(song.melody);
  return { ...song, melodyMap: map, totalSteps: total };
});

// ---------- 播放器 ----------
let playing = false;
let schedulerTimer = null;
let nextStepTime = 0;
let songIndex = 0;
let stepIndex = 0;
let noiseBuf = null;
let master = null;

function getNoise(ctx) {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

function playTone(ctx, freq, when, dur, { type = 'square', vol = 0.1 } = {}) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + Math.max(dur, 0.05));
  osc.connect(gain).connect(master);
  osc.start(when);
  osc.stop(when + dur + 0.05);
}

function playNoise(ctx, when, dur, { vol = 0.12, highpass = 1000 } = {}) {
  const src = ctx.createBufferSource();
  src.buffer = getNoise(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = highpass;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
  src.connect(filter).connect(gain).connect(master);
  src.start(when);
  src.stop(when + dur + 0.05);
}

function playKick(ctx, when) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, when);
  osc.frequency.exponentialRampToValueAtTime(45, when + 0.1);
  gain.gain.setValueAtTime(0.25, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.12);
  osc.connect(gain).connect(master);
  osc.start(when);
  osc.stop(when + 0.15);
}

/** 调度当前曲子的一个步（主旋律 + 贝斯 + 鼓） */
function scheduleStep(ctx, when) {
  const song = PREPARED[songIndex];
  const spb = song.stepsPerBar;
  const stepDur = 60 / song.bpm / 2;

  // 主旋律（方波，8-bit 味）
  const m = song.melodyMap.get(stepIndex);
  if (m) playTone(ctx, noteFreq(m.note), when, m.dur * stepDur * 0.92, { type: 'square', vol: 0.085 });

  // 贝斯（三角波）：小节头根音、小节中五音
  const bar = Math.floor(stepIndex / spb) % song.bass.length;
  const inBar = stepIndex % spb;
  const root = song.bass[bar];
  const bassNote = inBar === Math.floor(spb / 2) ? BASS_FIFTH[root] : `${root}3`;
  playTone(ctx, noteFreq(bassNote), when, stepDur * 0.9, { type: 'triangle', vol: 0.13 });

  // 鼓组：kick 在正拍、snare 在反拍、hat 均匀铺
  const half = Math.floor(spb / 2);
  if (inBar === 0 || inBar === half) playKick(ctx, when);
  if (inBar === Math.floor(spb / 4) || inBar === Math.floor(spb * 3 / 4)) playNoise(ctx, when, 0.08, { vol: 0.09, highpass: 1200 });
  if (inBar % 2 === 1) playNoise(ctx, when, 0.03, { vol: 0.04, highpass: 6000 });
}

function scheduler() {
  const ctx = ensureCtx();
  while (nextStepTime < ctx.currentTime + 0.15) {
    scheduleStep(ctx, nextStepTime);
    const song = PREPARED[songIndex];
    stepIndex += 1;
    if (stepIndex >= song.totalSteps) {
      // 当前曲子播完 → 无缝切到下一首循环
      stepIndex = 0;
      songIndex = (songIndex + 1) % PREPARED.length;
    }
    nextStepTime += 60 / song.bpm / 2;
  }
}

export function startMusic() {
  if (playing) return;
  const ctx = ensureCtx();
  if (!master) {
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
  }
  playing = true;
  nextStepTime = ctx.currentTime + 0.05;
  stepIndex = 0;
  songIndex = 0;
  schedulerTimer = setInterval(scheduler, 30);
  updateBtn();
}

export function stopMusic() {
  playing = false;
  clearInterval(schedulerTimer);
  schedulerTimer = null;
  updateBtn();
}

export const isMusicOn = () => playing;
export const isMusicMuted = () => localStorage.getItem(MUSIC_KEY) === 'off';

export function toggleMusic() {
  if (playing) {
    localStorage.setItem(MUSIC_KEY, 'off');
    stopMusic();
  } else {
    localStorage.setItem(MUSIC_KEY, 'on');
    startMusic();
  }
}

/** 初始化：恢复开关状态，并在首次用户交互后自动开始（浏览器要求手势解锁音频） */
export function initMusic() {
  const btn = document.getElementById('music-toggle');
  btn.addEventListener('click', () => toggleMusic());

  const once = () => {
    document.removeEventListener('pointerdown', once);
    if (!isMusicMuted()) startMusic();
  };
  document.addEventListener('pointerdown', once);
}

function updateBtn() {
  const btn = document.getElementById('music-toggle');
  if (btn) {
    btn.textContent = playing ? '🔊' : '🔇';
    btn.title = playing ? '关闭背景音乐' : '播放背景音乐';
  }
}
