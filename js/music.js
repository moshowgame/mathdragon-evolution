// 8-bit 芯片音乐 BGM：方波主旋律 + 三角波贝斯 + 噪声鼓组
// 红白机风格的原创循环旋律（致敬魂斗罗那种热血感）

import { ensureCtx } from './audio.js';

const MUSIC_KEY = 'mathdragon_music';
const TEMPO = 160;                 // BPM
const STEP = 60 / TEMPO / 2;       // 八分音符时长（秒）

// ---------- 乐谱 ----------
// [音符, 占用步数]，null 为休止；每小节 8 步（4/4 拍的八分音符）
const MELODY = [
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
];

// 每小节的和弦根音（A 段 Em G Em Am / B 段 C G Am G）
const BASS_BARS = ['E', 'G', 'E', 'A', 'C', 'G', 'A', 'G'];
const BASS_FIFTH = { E: 'B2', G: 'D3', A: 'E3', C: 'G2' };

// 鼓组节奏（每小节 8 步）：kick / snare / hat
const DRUMS = { kick: [0, 4], snare: [2, 6], hat: [1, 3, 5, 7] };

const TOTAL_STEPS = 64;

// ---------- 工具 ----------
const SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function noteFreq(name) {
  const m = /^([A-G])(\d)$/.exec(name);
  const midi = (Number(m[2]) + 1) * 12 + SEMITONES[m[1]];
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** 把音符序列展开为「步数 → {note, dur}」映射 */
function buildTrack(seq) {
  const map = new Map();
  let step = 0;
  for (const [note, dur] of seq) {
    if (note) map.set(step, { note, dur });
    step += dur;
  }
  return map;
}
const MELODY_MAP = buildTrack(MELODY);

// ---------- 播放器 ----------
let playing = false;
let schedulerTimer = null;
let nextStepTime = 0;
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

/** 调度一个循环步（主旋律 + 贝斯 + 鼓） */
function scheduleStep(ctx, index, when) {
  // 主旋律（方波，8-bit 味）
  const m = MELODY_MAP.get(index);
  if (m) playTone(ctx, noteFreq(m.note), when, m.dur * STEP * 0.92, { type: 'square', vol: 0.085 });

  // 贝斯（三角波）
  const bar = Math.floor(index / 8);
  const inBar = index % 8;
  const root = BASS_BARS[bar];
  const bassNote = (inBar === 2 || inBar === 6) ? BASS_FIFTH[root] : `${root}3`;
  playTone(ctx, noteFreq(bassNote), when, STEP * 0.9, { type: 'triangle', vol: 0.13 });

  // 鼓组
  if (DRUMS.kick.includes(inBar)) playKick(ctx, when);
  if (DRUMS.snare.includes(inBar)) playNoise(ctx, when, 0.08, { vol: 0.09, highpass: 1200 });
  if (DRUMS.hat.includes(inBar)) playNoise(ctx, when, 0.03, { vol: 0.04, highpass: 6000 });
}

function scheduler() {
  const ctx = ensureCtx();
  while (nextStepTime < ctx.currentTime + 0.15) {
    scheduleStep(ctx, stepIndex, nextStepTime);
    stepIndex = (stepIndex + 1) % TOTAL_STEPS;
    nextStepTime += STEP;
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
