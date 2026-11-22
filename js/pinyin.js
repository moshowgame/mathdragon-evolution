// 拼音王国（一期：单韵母入门）：听音认形 / 看形选音
// 发音：优先播预编译 MP3（Edge TTS 预生成），缺失时回退浏览器 speechSynthesis

import { sfx, speak } from './audio.js';
import { nextPraise } from './praise.js';
import { setMood, playFX } from './dragon.js';
import { recordQuizResult } from './storage.js';

const $ = (sel) => document.querySelector(sel);

/** 单韵母 + 四声调符号 */
const MARKS = {
  a: ['ā', 'á', 'ǎ', 'à'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
};
/** 文件名映射（ü → v） */
const FILE = { a: 'a', o: 'o', e: 'e', i: 'i', u: 'u', 'ü': 'v' };
const TONE_NAMES = ['第一声（一声平）', '第二声（二声扬）', '第三声（三声拐弯）', '第四声（四声降）'];
const TOTAL = 10;

let player = null;
let state = null;
let inited = false;

/** 播一个单韵母的某个声调（预编译 MP3 优先，TTS 保底） */
export function playPinyin(py, tone) {
  try { if (player) player.pause(); } catch { /* 静默 */ }
  player = new Audio(`./assets/audio/pinyin/${FILE[py]}${tone}.mp3`);
  const p = player;
  p.play().catch(() => {
    if (!MARKS[py]) return speak(py, { lang: 'zh-CN' });
    speak(MARKS[py][tone - 1], { lang: 'zh-CN' });
  });
}

const rand = (n) => Math.floor(Math.random() * n);
const COMBOS = Object.keys(MARKS).flatMap(py => [1, 2, 3, 4].map(tone => ({ py, tone })));

function genQuestion(used) {
  let q;
  let guard = 0;
  do {
    q = COMBOS[rand(COMBOS.length)];
  } while (used.has(`${q.py}${q.tone}`) && guard++ < 40);
  used.add(`${q.py}${q.tone}`);
  // 干扰项：其余 23 个组合里随机挑 3 个
  const distract = COMBOS.filter(c => !(c.py === q.py && c.tone === q.tone))
    .sort(() => Math.random() - 0.5).slice(0, 3);
  return { ...q, options: [q, ...distract].sort(() => Math.random() - 0.5) };
}

function startRound(mode) {
  state = { mode, idx: 0, correct: 0, used: new Set(), current: null };
  $('#py-home').classList.add('hidden');
  $('#py-game').classList.remove('hidden');
  $('#py-finish').classList.add('hidden');
  nextQuestion();
}

function nextQuestion() {
  state.idx++;
  state.current = genQuestion(state.used);
  const { py, tone, options } = state.current;
  $('#py-progress').textContent = `第 ${state.idx} / ${TOTAL} 题`;
  $('#py-note').textContent = '';
  $('#py-note').classList.add('hidden');

  if (state.mode === 'listen') {
    // 听音认形：听 → 选正确的拼音
    $('#py-target').textContent = '🔊';
    setTimeout(() => playPinyin(py, tone), 350);
  } else {
    // 看形选音：看 → 找出发音正确的那个喇叭
    $('#py-target').textContent = MARKS[py][tone - 1];
  }

  const box = $('#py-options');
  box.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'py-option';
    btn.innerHTML = state.mode === 'listen' ? MARKS[opt.py][opt.tone - 1] : '🔊';
    btn.addEventListener('click', () => {
      if (state.mode === 'read') {
        // 看形选音：先播这个选项的发音，听清后再判定
        playPinyin(opt.py, opt.tone);
        setTimeout(() => answer(opt, btn), 1000);
      } else {
        answer(opt, btn);
      }
    });
    box.appendChild(btn);
  });
}

function answer(opt, btn) {
  const { py, tone } = state.current;
  const isRight = opt.py === py && opt.tone === tone;
  const bubble = $('#py-bubble');

  if (isRight) {
    state.correct++;
    sfx.correct();
    setMood('happy');
    playFX('confetti', 1000);
    const praise = nextPraise();
    speak(praise.text, { lang: praise.tts });
    bubble.textContent = praise.text;
    btn.classList.add('right');
  } else {
    sfx.wrong();
    setMood('sad');
    btn.classList.add('wrong');
    bubble.textContent = '唔，再听一听～';
    // 解析：展示正确答案 + 声调口诀
    $('#py-note').innerHTML = `正确答案是 <strong>${MARKS[py][tone - 1]}</strong> · ${TONE_NAMES[tone - 1]}`;
    $('#py-note').classList.remove('hidden');
    setTimeout(() => playPinyin(py, tone), 500);
  }
  [...$('#py-options').children].forEach(b => b.disabled = true);

  setTimeout(() => {
    [...$('#py-options').children].forEach(b => {
      b.classList.remove('right', 'wrong');
      b.disabled = false;
    });
    if (state.idx >= TOTAL) finishRound();
    else nextQuestion();
  }, isRight ? 1300 : 2200);
}

function finishRound() {
  const rate = Math.round(state.correct / TOTAL * 100);
  const { starsEarned, streakDays } = recordQuizResult({
    module: 'py', level: 10, correct: state.correct, total: TOTAL, wrongs: [],
  });
  $('#py-game').classList.add('hidden');
  const fin = $('#py-finish');
  fin.classList.remove('hidden');
  fin.innerHTML = `
    <div class="py-finish-title">${state.correct >= 8 ? '🎉 太厉害啦！' : state.correct >= 6 ? '💪 很不错！' : '📚 继续加油！'}</div>
    <div class="py-finish-score">答对 <strong>${state.correct}</strong> / ${TOTAL} 题（${rate}%）</div>
    <div class="py-finish-stars">⭐ +${starsEarned} ${starsEarned >= 2 ? '（今日首次完成翻倍）' : ''} · 已连续打卡 ${streakDays} 天</div>
    <div class="py-finish-actions">
      <button class="btn-start small" id="py-again">🔄 再来一轮</button>
      <button class="btn-start small" id="py-back">🏠 返回首页</button>
    </div>`;
  $('#py-again').addEventListener('click', () => { sfx.pickup(); startRound(state.mode); });
  $('#py-back').addEventListener('click', () => goHome());
  if (state.correct >= 8) playFX('confetti', 1600);
  speak(`本轮答对${state.correct}题，${rate >= 80 ? '太棒啦！' : '继续练习哦！'}`);
  state = null;
}

function goHome() {
  document.dispatchEvent(new CustomEvent('py:home'));
}

/** 初始化拼音王国（懒加载，只绑一次） */
export function initPinyin() {
  if (inited) return;
  inited = true;

  $('#py-btn-listen').addEventListener('click', () => { sfx.pickup(); startRound('listen'); });
  $('#py-btn-read').addEventListener('click', () => { sfx.pickup(); startRound('read'); });
  $('#py-replay').addEventListener('click', () => {
    if (state) playPinyin(state.current.py, state.current.tone);
  });
  $('#py-target').addEventListener('click', () => {
    // 看形选音模式下点大字也可以重听
    if (state && state.mode === 'listen') playPinyin(state.current.py, state.current.tone);
  });
}
