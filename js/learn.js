// 学习乐园：加减乘除与简单方程的分步动画解析（教学演示）+ 拼音分阶段学习

import { buildExplanation } from './explain.js';
import { sfx } from './audio.js';
import { POOLS, playPinyin, playSyllable, show, SYLLABLES } from './pinyin.js';

const $ = (sel) => document.querySelector(sel);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

let currentOp = 'add';
let timers = [];
let inited = false;
let pyStage = 'vowel';

/** 拼音学习阶段 */
const PY_STAGES = [
  { key: 'vowel', label: '单韵母' },
  { key: 'initial', label: '声母' },
  { key: 'final', label: '复韵母' },
  { key: 'nasal', label: '鼻韵母' },
  { key: 'whole', label: '整体认读' },
  { key: 'blend', label: '拼读' },
];

/** 整体认读例字（整体记，不用拼） */
const WHOLE_WORDS = {
  zhi: '织 zhī', chi: '吃 chī', shi: '狮 shī', ri: '日 rì',
  zi: '字 zì', ci: '刺 cì', si: '丝 sī',
  yi: '一 yī', wu: '五 wǔ', yu: '鱼 yú',
  ye: '爷 yé', yue: '月 yuè', yuan: '圆 yuán',
  yin: '因 yīn', yun: '云 yún', ying: '鹰 yīng',
};

const TONE_TIPS = ['一声平', '二声扬', '三声拐弯', '四声降'];

/** 发音小喇叭按钮 */
const speakBtn = (py, tone = 1) => `<button class="py-speak" data-py="${py}" data-tone="${tone}" title="听发音">🔊</button>`;
/** 音节例字按钮 */
const wordBtn = (file, text) => `<button class="py-speak py-speak-word" data-file="${file}" title="听发音">🔊</button>${text}`;

/** 挑一个音节的所有例字按钮串 */
const wordList = (list, n = 4) => list.slice(0, n).map(s => wordBtn(s.file, `${s.char} ${s.py}`)).join('　');

/** 生成拼音教学步骤（按当前阶段） */
function buildPyLesson() {
  if (pyStage === 'blend') {
    // 拼读：随机音节，声母 + 韵母 → 例字
    const syl = SYLLABLES[rand(0, SYLLABLES.length - 1)];
    const sameIni = SYLLABLES.filter(s => s.ini === syl.ini && s !== syl);
    return {
      title: `拼音拼读：${syl.py}`,
      autoplay: () => playSyllable(syl),
      steps: [
        { icon: '👀', text: `看一看：声母 <b>${syl.ini}</b> 加上韵母 <b>${syl.fin}</b>`, math: `${syl.ini} + ${syl.fin}` },
        { icon: '🗣️', text: '拼出来，读一读：', math: `${wordBtn(syl.file, syl.py)}` },
        { icon: '✅', text: `这个音节就是「<b>${syl.char}</b>」字！`, final: true },
        ...(sameIni.length ? [{ icon: '✏️', text: `「${syl.ini}」还能拼：`, math: wordList(sameIni, 3) }] : []),
      ],
    };
  }

  if (pyStage === 'whole') {
    const items = POOLS.whole.items;
    const py = items[rand(0, items.length - 1)];
    return {
      title: `整体认读：${py}`,
      autoplay: () => playPinyin(py),
      steps: [
        { icon: '👂', text: `认识整体认读音节 <b>${py}</b>（要整体记，不能拼读哦）`, math: speakBtn(py) },
        { icon: '✏️', text: `读一读：${WHOLE_WORDS[py] || ''}`, math: speakBtn(py), final: true },
      ],
    };
  }

  // 单韵母 / 声母 / 复韵母 / 鼻韵母：认识 + 例字
  const stagePools = { vowel: POOLS.vowel, initial: POOLS.initial, final: POOLS.final, nasal: POOLS.nasal };
  const pool = stagePools[pyStage];
  const py = pool.items[rand(0, pool.items.length - 1)];
  const nameMap = { vowel: '单韵母', initial: '声母', final: '复韵母', nasal: '鼻韵母' };

  if (pyStage === 'vowel') {
    const tones = [1, 2, 3, 4].map(t => `<span class="py-tone">${show(py, t)}${speakBtn(py, t)}<i>${TONE_TIPS[t - 1]}</i></span>`).join('');
    const words = SYLLABLES.filter(s => s.fin === py);
    return {
      title: `单韵母：${py}`,
      autoplay: () => playPinyin(py),
      steps: [
        { icon: '👂', text: `认识单韵母 <b>${py}</b>，听一听它的音：`, math: speakBtn(py) },
        { icon: '🎵', text: `它有四个声调：`, math: tones },
        { icon: '✏️', text: '拼读例字：', math: words.length ? wordList(words) : '（先把它读熟练吧！）', final: true },
      ],
    };
  }

  // 声母 / 复韵母 / 鼻韵母
  const words = SYLLABLES.filter(s => s[pyStage === 'initial' ? 'ini' : 'fin'] === py);
  const kind = pyStage === 'initial' ? '声母' : '韵母';
  const step2 = words.length
    ? { icon: '✏️', text: `${kind}例字：`, math: wordList(words), final: true }
    : { icon: '✏️', text: `例字：而 ér、耳 ěr、二 èr（er 喜欢单独出现）`, math: speakBtn(py), final: true };
  return {
    title: `${nameMap[pyStage]}：${py}`,
    autoplay: () => playPinyin(py),
    steps: [
      { icon: '👂', text: `认识${nameMap[pyStage]} <b>${py}</b>，听一听它的音：`, math: speakBtn(py) },
      step2,
    ],
  };
}

/** 生成教学示例题（挑最有代表性的类型） */
function genExample(op) {
  switch (op) {
    case 'add': {
      // 偏重凑十法示例（进位加），也有十以内数数法
      if (Math.random() < 0.65) {
        const a = rand(5, 9);
        const b = rand(11 - a, 9);
        return { a, b, op: '+', answer: a + b, cross10: true };
      }
      const a = rand(2, 8);
      const b = rand(1, 10 - a);
      return { a, b, op: '+', answer: a + b };
    }
    case 'sub': {
      // 偏重破十法示例（退位减）
      if (Math.random() < 0.65) {
        const a = rand(11, 18);
        const b = rand(a - 10 + 1, 9);
        return { a, b, op: '−', answer: a - b, cross10: true };
      }
      const a = rand(5, 10);
      const b = rand(1, a - 1);
      return { a, b, op: '−', answer: a - b };
    }
    case 'mult': {
      // 乘法教学先从 10 以内的乘法开始（积 ≤ 10），再逐步到全表
      if (Math.random() < 0.6) {
        const smalls = [[2, 2], [2, 3], [3, 2], [2, 4], [4, 2], [2, 5], [5, 2], [3, 3]];
        const [sa, sb] = smalls[rand(0, smalls.length - 1)];
        return { a: sa, b: sb, op: '×', answer: sa * sb };
      }
      const a = rand(2, 9);
      const b = rand(2, 9);
      return { a, b, op: '×', answer: a * b };
    }
    case 'div': {
      // 表内除法
      const b = rand(2, 9);
      const ans = rand(2, 9);
      return { a: b * ans, b, op: '÷', answer: ans };
    }
  }
}

function genDivEq() {
  const a = rand(2, 9);
  const ans = rand(2, 9);
  return { a, b: ans, op: 'eq', form: 'x÷a', answer: ans * a };
}

/** 渲染分步动画（共用：数学解析 / 拼音教学） */
function animateSteps(title, steps, opts = {}) {
  const list = $('#learn-steps');
  list.innerHTML = '';
  $('#learn-title').textContent = `🎓 ${title}`;
  steps.forEach((st, i) => {
    const div = document.createElement('div');
    div.className = 'learn-step' + (st.final ? ' final' : '');
    div.innerHTML = `<span class="step-icon">${st.icon}</span>
      <span class="step-text">${st.text}</span>
      ${st.math ? `<span class="step-math">${st.math}</span>` : ''}`;
    list.appendChild(div);
    timers.push(setTimeout(() => {
      div.classList.add('show');
      if (st.final) { sfx.correct(); }
      else sfx.pickup();
    }, 650 * (i + 1)));
  });
  if (opts.autoplay) timers.push(setTimeout(opts.autoplay, 500));
  else import('./audio.js').then((a) => a.speak(`我们一起来学：${title}`));
}

function renderSteps(exp) {
  const { title, steps } = buildExplanation(exp);
  animateSteps(title, steps);
}

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

function play() {
  clearTimers();
  if (currentOp === 'py') {
    const lesson = buildPyLesson();
    animateSteps(lesson.title, lesson.steps, { autoplay: lesson.autoplay });
    return;
  }
  const exp = currentOp === 'eq' ? genDivEq() : genExample(currentOp);
  renderSteps(exp);
}

/** 初始化学习乐园（懒加载，只绑一次） */
export function initLearn() {
  if (inited) return;
  inited = true;

  document.querySelectorAll('#learn-tabs .learn-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#learn-tabs .learn-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentOp = tab.dataset.op;
      sfx.pickup();
      $('#py-stage-bar').classList.toggle('hidden', currentOp !== 'py');
      play();
    });
  });

  // 拼音阶段选择
  const stageBar = $('#py-stage-bar');
  PY_STAGES.forEach(st => {
    const btn = document.createElement('button');
    btn.className = 'py-pool-tab';
    btn.textContent = st.label;
    btn.dataset.stage = st.key;
    btn.addEventListener('click', () => {
      pyStage = st.key;
      [...stageBar.children].forEach(b => b.classList.toggle('active', b.dataset.stage === st.key));
      sfx.pickup();
      play();
    });
    stageBar.appendChild(btn);
  });
  stageBar.firstChild.classList.add('active');

  // 教学步骤里的发音按钮（事件委托）
  $('#learn-steps').addEventListener('click', (e) => {
    const btn = e.target.closest('.py-speak');
    if (!btn) return;
    sfx.pickup();
    if (btn.dataset.file) {
      const syl = SYLLABLES.find(s => s.file === btn.dataset.file);
      if (syl) playSyllable(syl);
    } else {
      playPinyin(btn.dataset.py, +(btn.dataset.tone || 1));
    }
  });

  $('#learn-next').addEventListener('click', () => { sfx.pickup(); play(); });
  $('#learn-replay').addEventListener('click', () => { sfx.pickup(); play(); });
}
