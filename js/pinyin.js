// 拼音王国（二期全量）：单韵母 / 声母 / 复韵母 / 鼻韵母 / 整体认读 + 听音认形 / 看形选音 / 声调挑战 / 拼读拼字
// 发音：优先播预编译 MP3（Edge TTS 预生成，158 个），缺失时回退浏览器 speechSynthesis

import { sfx, speak } from './audio.js';
import { nextPraise } from './praise.js';
import { setMood, playFX } from './dragon.js';
import { recordQuizResult } from './storage.js';

const $ = (sel) => document.querySelector(sel);

/** 单韵母四声调符号（多音条目） */
const MARKS = {
  a: ['ā', 'á', 'ǎ', 'à'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
};

/** 内容池：key → { label, level, items }（items 元素为拼音串） */
export const POOLS = {
  vowel:  { label: '单韵母',   level: 10, items: Object.keys(MARKS) },
  initial:{ label: '声母',     level: 11, items: ['b','p','m','f','d','t','n','l','g','k','h','j','q','x','zh','ch','sh','r','z','c','s','y','w'] },
  final:  { label: '复韵母',   level: 12, items: ['ai','ei','ui','ao','ou','iu','ie','üe','er'] },
  nasal:  { label: '鼻韵母',   level: 13, items: ['an','en','in','un','ün','ang','eng','ing','ong'] },
  whole:  { label: '整体认读', level: 14, items: ['zhi','chi','shi','ri','zi','ci','si','yi','wu','yu','ye','yue','yuan','yin','yun','ying'] },
};

/** 文件名映射（ü 系列特殊名） */
const FILE = {
  a:'a', o:'o', e:'e', i:'i', u:'u', 'ü':'v',
  'üe':'ve', 'ün':'vn',
};

/** 声调标注规则（供 SYLLABLES 构建与拼读展示使用） */
const TONE_MARKS = { a:['ā','á','ǎ','à'], o:['ō','ó','ǒ','ò'], e:['ē','é','ě','è'], i:['ī','í','ǐ','ì'], u:['ū','ú','ǔ','ù'], 'ü':['ǖ','ǘ','ǚ','ǜ'] };
const MAIN_VOWEL = { ai:'a', ei:'e', ui:'i', ao:'a', ou:'o', iu:'u', ie:'e', 'üe':'e', er:'e', an:'a', en:'e', in:'i', un:'u', 'ün':'u', ang:'a', eng:'e', ing:'i', ong:'o' };
/** 给韵母加上正确位置的声调符号，如 in+2 → ín（语文标准：ai 标 a、iu 标 u、ün 标 u…） */
function toneFinal(fin, tone) {
  const v = MAIN_VOWEL[fin];
  if (!v) return fin;
  const marked = TONE_MARKS[v]?.[tone - 1];
  return marked ? fin.replace(v, marked) : fin;
}

/** 拼读音节库（拼读拼字玩法 / 学习乐园例字）：[声母, 韵母, 声调, 例字, 文件名] */
export const SYLLABLES = [
  ['b','a',4,'爸'], ['m','a',1,'妈'], ['d','a',4,'大'], ['h','a',3,'哈'],
  ['p','o',1,'坡'], ['m','o',1,'摸'], ['b','o',2,'伯'],
  ['g','e',1,'哥'], ['k','e',2,'颗'], ['h','e',4,'贺'], ['d','e',2,'德'],
  ['j','i',1,'鸡'], ['q','i',2,'棋'], ['x','i',3,'喜'], ['d','i',4,'地'], ['t','i',2,'提'], ['l','i',3,'里'],
  ['g','u',1,'姑'], ['h','u',2,'壶'], ['t','u',3,'土'], ['d','u',4,'度'], ['k','u',4,'酷'],
  ['b','ai',2,'白'], ['p','ai',4,'派'], ['m','ai',3,'买'], ['l','ai',2,'来'],
  ['b','ei',4,'贝'], ['p','ei',2,'陪'], ['m','ei',4,'妹'], ['f','ei',1,'飞'],
  ['d','ao',4,'到'], ['t','ao',1,'涛'], ['n','ao',3,'脑'], ['l','ao',4,'老'], ['g','ao',1,'高'], ['h','ao',3,'好'],
  ['g','ou',3,'狗'], ['h','ou',4,'后'], ['t','ou',2,'头'], ['d','ou',4,'豆'],
  ['n','iu',2,'牛'], ['l','iu',4,'六'], ['q','iu',2,'球'], ['j','iu',3,'酒'],
  ['x','ie',4,'谢'], ['j','ie',3,'姐'], ['y','e',4,'夜'],
  ['x','ue',3,'雪'], ['y','ue',4,'月'], ['q','ue',2,'缺'],
  ['n','ü',3,'女'], ['l','ü',4,'绿'],
  ['sh','an',1,'山'], ['s','an',3,'伞'], ['r','an',2,'然'],
  ['m','en',2,'门'], ['r','en',2,'人'], ['f','en',1,'分'],
  ['j','in',1,'金'], ['x','in',1,'心'], ['q','in',2,'琴'],
  ['b','ang',1,'帮'], ['f','ang',2,'房'], ['t','ang',2,'糖'], ['l','ang',2,'狼'], ['h','ang',2,'航'],
  ['zh','ang',1,'张'], ['sh','ang',4,'上'],
  ['d','eng',1,'灯'], ['f','eng',1,'风'], ['t','eng',2,'疼'], ['m','eng',4,'梦'],
  ['x','ing',1,'星'], ['q','ing',2,'晴'], ['j','ing',1,'京'],
  ['zh','ong',1,'中'], ['ch','ong',1,'冲'],
].map(([ini, fin, tone, char]) => ({
  ini, fin, tone, char,
  file: `${ini}-${fin.replace('ü', 'v')}${tone}`,
  py: ini + toneFinal(fin, tone), // 展示用带调音节（声调标主元音）
}));

const TONE_NAMES = ['第一声（一声平）', '第二声（二声扬）', '第三声（三声拐弯）', '第四声（四声降）'];
/** 拼读音节展示：声母 + 带调韵母，如 x + īn */
const sylLabel = (syl) => `${syl.ini} + ${toneFinal(syl.fin, syl.tone)}`;
const TOTAL = 10;

let player = null;
let state = null;
let inited = false;
let lastPool = 'vowel'; // 记住内容池选择（结算后再来一轮不丢失）

/** 音频文件名（含声调数字）：单韵母 1-4，其余条目固定 1 */
function audioFile(py, tone) {
  return `./assets/audio/pinyin/${FILE[py] || py}${MARKS[py] ? tone : 1}.mp3`;
}

/** 播一个拼音的发音（预编译 MP3 优先，TTS 保底） */
export function playPinyin(py, tone = 1) {
  try { if (player) player.pause(); } catch { /* 静默 */ }
  player = new Audio(audioFile(py, tone));
  const p = player;
  p.play().catch(() => {
    const text = MARKS[py] ? MARKS[py][tone - 1] : py;
    speak(text, { lang: 'zh-CN' });
  });
}

/** 播拼读音节（例字发音） */
export function playSyllable(syl) {
  try { if (player) player.pause(); } catch { /* 静默 */ }
  player = new Audio(`./assets/audio/pinyin/${syl.file}.mp3`);
  const p = player;
  p.play().catch(() => speak(syl.char, { lang: 'zh-CN' }));
}

/** 显示用文本：单韵母带调，其余原样 */
export const show = (py, tone = 1) => (MARKS[py] ? MARKS[py][tone - 1] : py);

const rand = (n) => Math.floor(Math.random() * n);
const pickOther = (pool, exclude) => {
  const others = pool.filter(x => x !== exclude).sort(() => Math.random() - 0.5);
  return others.slice(0, 3);
};

function genQuestion() {
  const { pool, mode } = state;
  if (mode === 'tone') {
    // 声调挑战：同一个单韵母的 4 个声调辨析
    const py = POOLS.vowel.items[rand(POOLS.vowel.items.length)];
    const tone = 1 + rand(4);
    return {
      kind: 'tone', py, tone,
      options: [1, 2, 3, 4].sort(() => Math.random() - 0.5),
      label: show(py, tone),
    };
  }
  if (mode === 'word') {
    // 拼读拼字：声母 + 韵母 → 选例字
    const syl = SYLLABLES[rand(SYLLABLES.length)];
    const chars = pickOther(SYLLABLES.map(s => s.char), syl.char);
    return {
      kind: 'word', syl,
      options: [syl.char, ...chars].sort(() => Math.random() - 0.5),
      label: sylLabel(syl),
    };
  }
  // 听音认形 / 看形选音：从当前内容池抽条目
  const items = POOLS[pool].items;
  let py;
  let guard = 0;
  do { py = items[rand(items.length)]; } while (state.used.has(py) && guard++ < 30);
  state.used.add(py);
  const tone = MARKS[py] ? 1 + rand(4) : 1;
  const distract = pickOther(items, py);
  return {
    kind: mode, py, tone,
    options: [py, ...distract].sort(() => Math.random() - 0.5),
  };
}

function startRound(mode) {
  state = { mode, pool: lastPool, idx: 0, correct: 0, used: new Set() };
  $('#py-home').classList.add('hidden');
  $('#py-game').classList.remove('hidden');
  $('#py-finish').classList.add('hidden');
  nextQuestion();
}

function nextQuestion() {
  state.idx++;
  state.current = genQuestion();
  const q = state.current;
  $('#py-progress').textContent = `第 ${state.idx} / ${TOTAL} 题 · ${
    q.kind === 'tone' ? '声调挑战' : q.kind === 'word' ? '拼读拼字' : POOLS[state.pool].label
  }`;
  $('#py-note').textContent = '';
  $('#py-note').classList.add('hidden');

  if (q.kind === 'listen' || q.kind === 'tone') {
    $('#py-target').textContent = q.kind === 'tone' ? q.py.toUpperCase() : '🔊';
    setTimeout(() => playPinyin(q.py, q.tone), 350);
  } else {
    $('#py-target').textContent = q.label;
    if (q.kind === 'word') setTimeout(() => playSyllable(q.syl), 350);
  }

  const box = $('#py-options');
  box.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'py-option';
    if (q.kind === 'listen') btn.textContent = show(opt, q.tone);
    else if (q.kind === 'tone') btn.textContent = MARKS[q.py][opt - 1];
    else if (q.kind === 'word') btn.textContent = opt;
    else btn.textContent = '🔊';
    btn.addEventListener('click', () => {
      if (q.kind === 'read') {
        playPinyin(opt, q.tone);
        setTimeout(() => answer(opt, btn), 1000);
      } else {
        answer(opt, btn);
      }
    });
    box.appendChild(btn);
  });
}

function answer(opt, btn) {
  const q = state.current;
  let isRight, rightText;
  if (q.kind === 'tone') {
    isRight = opt === q.tone;
    rightText = `${show(q.py, q.tone)} · ${TONE_NAMES[q.tone - 1]}`;
  } else if (q.kind === 'word') {
    isRight = opt === q.syl.char;
    rightText = `${sylLabel(q.syl)} → ${q.syl.char}（${q.syl.py}）`;
  } else {
    isRight = opt === q.py;
    rightText = `${show(q.py, q.tone)}${MARKS[q.py] ? ' · ' + TONE_NAMES[q.tone - 1] : ''}`;
  }
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
    // 解析：正确答案 + 声调口诀 / 拼读过程
    $('#py-note').innerHTML = `正确答案是 <strong>${rightText.split(' · ')[0]}</strong>${
      rightText.includes(' · ') ? ' · ' + rightText.split(' · ')[1] : rightText.includes('→') ? ' · ' + rightText.split('→ ')[1] : ''
    }`;
    $('#py-note').classList.remove('hidden');
    if (q.kind === 'word') setTimeout(() => playSyllable(q.syl), 500);
    else setTimeout(() => playPinyin(q.py, q.tone), 500);
  }
  [...$('#py-options').children].forEach(b => b.disabled = true);

  setTimeout(() => {
    [...$('#py-options').children].forEach(b => {
      b.classList.remove('right', 'wrong');
      b.disabled = false;
    });
    if (state.idx >= TOTAL) finishRound();
    else nextQuestion();
  }, isRight ? 1300 : 2400);
}

function finishRound() {
  const { mode, pool } = state;
  const level = mode === 'tone' ? 15 : mode === 'word' ? 20 : POOLS[pool].level;
  const rate = Math.round(state.correct / TOTAL * 100);
  const { starsEarned, streakDays } = recordQuizResult({
    module: 'py', level, correct: state.correct, total: TOTAL, wrongs: [],
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
      <button class="btn-start small" id="py-modes">📖 玩法选择</button>
      <button class="btn-start small" id="py-back">🏠 返回首页</button>
    </div>`;
  const again = $('#py-again');
  const back = $('#py-back');
  const lastMode = mode;
  again.addEventListener('click', () => { sfx.pickup(); startRound(lastMode); });
  $('#py-modes').addEventListener('click', () => {
    sfx.pickup();
    fin.classList.add('hidden');
    $('#py-home').classList.remove('hidden');
  });
  back.addEventListener('click', () => goHome());
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

  // 内容池切换标签
  const tabs = $('#py-pools');
  Object.entries(POOLS).forEach(([key, pool]) => {
    const tab = document.createElement('button');
    tab.className = 'py-pool-tab';
    tab.textContent = pool.label;
    tab.dataset.pool = key;
    tab.addEventListener('click', () => {
      state = { pool: key };
      lastPool = key;
      [...tabs.children].forEach(t => t.classList.toggle('active', t.dataset.pool === key));
      sfx.pickup();
    });
    tabs.appendChild(tab);
  });
  tabs.firstChild.classList.add('active');
  state = { pool: 'vowel' };

  $('#py-btn-listen').addEventListener('click', () => { sfx.pickup(); startRound('listen'); });
  $('#py-btn-read').addEventListener('click', () => { sfx.pickup(); startRound('read'); });
  $('#py-btn-tone').addEventListener('click', () => { sfx.pickup(); startRound('tone'); });
  $('#py-btn-word').addEventListener('click', () => { sfx.pickup(); startRound('word'); });
  $('#py-replay').addEventListener('click', () => {
    if (!state || !state.current) return;
    const q = state.current;
    if (q.kind === 'word') playSyllable(q.syl);
    else playPinyin(q.py, q.tone);
  });
  $('#py-target').addEventListener('click', () => {
    if (state && state.current && state.current.kind === 'listen') playPinyin(state.current.py, state.current.tone);
  });
}
