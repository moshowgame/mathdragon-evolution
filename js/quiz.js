// 答题流程：拖拽作答、音效语音反馈、错题解析、计时挑战、结算与进化

import { generateQuestions, questionsFromWrongs } from './questions.js';
import { buildExplanation } from './explain.js';
import { sfx, speak, PRAISE } from './audio.js';
import { setMood, playFX, playEvolution, getStage, resetPatience, grantUlt, STAGES } from './dragon.js';
import { recordQuizResult } from './storage.js';

const $ = (sel) => document.querySelector(sel);

const CHALLENGE_SECONDS = 60;
const MODULE_NAMES = { add: '加法', sub: '减法', mult: '乘法', div: '除法' };

const state = {
  module: 'add',
  level: 10,
  count: 10,
  mode: 'normal', // normal | challenge
  questions: [],
  idx: 0,
  correct: 0,
  wrongs: [],   // 本轮错题记录
  locked: false,
  timerId: null,
  timeLeft: 0,
};

export function startQuiz(config) {
  const { questions, ...rest } = config;
  Object.assign(state, {
    module: 'add', level: 10, count: 10, mode: 'normal',
    idx: 0, correct: 0, wrongs: [], locked: false, timerId: null, timeLeft: CHALLENGE_SECONDS,
  }, rest);
  state.questions = questions || generateQuestions(state.module, state.level, state.count);
  if (state.mode === 'challenge') state.questions = state.questions.slice(0, 100);
  state.count = state.questions.length;
  showScreen('quiz');
  renderQuestion();
  if (state.mode === 'challenge') startTimer();
}

/** 退出答题（返回首页时调用，清理计时器） */
export function quitQuiz() {
  clearInterval(state.timerId);
  state.timerId = null;
}

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  $(`#screen-${name}`).classList.remove('hidden');
}

// ---------- 计时挑战 ----------
function startTimer() {
  state.timeLeft = CHALLENGE_SECONDS;
  updateTimerUI();
  state.timerId = setInterval(() => {
    state.timeLeft--;
    updateTimerUI();
    if (state.timeLeft <= 0) {
      clearInterval(state.timerId);
      state.timerId = null;
      state.locked = true; // 阻止继续作答
      finish();
    }
  }, 1000);
}

function updateTimerUI() {
  $('#progress-text').textContent = `⏱ 剩余 ${state.timeLeft} 秒`;
  $('#progress-fill').style.width = `${(state.timeLeft / CHALLENGE_SECONDS) * 100}%`;
}

function renderQuestion() {
  const q = state.questions[state.idx];
  state.locked = false;

  if (q.op === 'eq') {
    // 方程题：第一行完整方程，第二行 "X = ?"（X 大写高亮，× 换色防混淆）
    const left = {
      'x+a': `<span class="var-x">X</span> + ${q.a}`,
      'x-a': `<span class="var-x">X</span> − ${q.a}`,
      'a×x': `${q.a} <span class="op-mul">×</span> <span class="var-x">X</span>`,
      'x÷a': `<span class="var-x">X</span> ÷ ${q.a}`,
    }[q.form];
    $('#eq-normal-row').classList.add('hidden');
    $('#eq-x-row').classList.remove('hidden');
    $('#equation').classList.add('eq-mode');
    $('#eq-full').innerHTML = `${left} <span class="op eq-sign">=</span> ${q.b}`;
  } else {
    $('#eq-normal-row').classList.remove('hidden');
    $('#eq-x-row').classList.add('hidden');
    $('#equation').classList.remove('eq-mode');
    $('#num-a').textContent = q.a;
    $('#num-op').textContent = q.op;
    $('#num-b').textContent = q.b;
    $('#num-op').classList.toggle('op-mul', q.op === '×');
  }
  $('#answer-content').textContent = '?';
  const box = $('#answer-box');
  box.className = 'answer-box';
  $('#question-bubble').textContent = state.mode === 'challenge'
    ? '速度越快越厉害，冲呀！'
    : `第 ${state.idx + 1} 题：把正确答案拖到盒子里吧！`;
  if (state.mode !== 'challenge') {
    $('#progress-text').textContent = `${state.idx + 1} / ${state.count}`;
    $('#progress-fill').style.width = `${(state.idx / state.count) * 100}%`;
  }
  $('#score-num').textContent = state.correct;

  const optionsEl = $('#options');
  optionsEl.innerHTML = '';
  q.options.forEach(v => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = v;
    btn.dataset.value = v;
    optionsEl.appendChild(btn);
    attachDrag(btn);
  });
}

// ---------- 拖拽（Pointer Events，兼容触屏）----------
function attachDrag(option) {
  option.addEventListener('pointerdown', (e) => {
    if (state.locked) return;
    e.preventDefault();
    option.setPointerCapture(e.pointerId);

    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.textContent = option.textContent;
    document.body.appendChild(ghost);
    let moved = false;
    const startX = e.clientX, startY = e.clientY;

    const move = (ev) => {
      moved = moved || Math.hypot(ev.clientX - startX, ev.clientY - startY) > 8;
      ghost.style.left = `${ev.clientX}px`;
      ghost.style.top = `${ev.clientY}px`;
      const over = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('#answer-box');
      $('#answer-box').classList.toggle('drag-over', !!over);
    };

    const up = (ev) => {
      option.removeEventListener('pointermove', move);
      option.removeEventListener('pointerup', up);
      option.removeEventListener('pointercancel', up);
      ghost.remove();
      option.classList.remove('dragging');
      $('#answer-box').classList.remove('drag-over');
      if (moved) {
        const over = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('#answer-box');
        if (over) answer(Number(option.dataset.value), option);
      } else {
        // 视为点击：直接作答
        answer(Number(option.dataset.value), option);
      }
    };

    option.classList.add('dragging');
    option.addEventListener('pointermove', move);
    option.addEventListener('pointerup', up);
    option.addEventListener('pointercancel', up);
  });
}

// ---------- 作答 ----------
function answer(value, optionEl) {
  if (state.locked) return;
  state.locked = true;
  resetPatience(); // 答完一题，火龙的耐心重置

  const q = state.questions[state.idx];
  const box = $('#answer-box');
  const content = $('#answer-content');

  if (value === q.answer) {
    // ✅ 答对
    state.correct++;
    $('#score-num').textContent = state.correct;
    // 每答对 10 题奖励大招次数（答 20 题以上的轮次翻倍）
    if (state.correct % 10 === 0) {
      const reward = state.count >= 20 ? 4 : 2;
      grantUlt(reward);
      speak(`答对${state.correct}题！获得${reward}次大招机会！`);
    }
    content.textContent = value;
    box.classList.add('correct');
    optionEl.classList.add('is-correct-reveal');
    document.querySelectorAll('.option').forEach(o => { if (o !== optionEl) o.classList.add('faded'); });
    sfx.correct();
    if (state.mode !== 'challenge') {
      speak(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
      setMood('happy');
      playFX('confetti', 1300);
      $('#question-bubble').textContent = pick(['哇！答对啦！', '太厉害了！', '你真棒！']);
    }
    $('#progress-fill').style.width = state.mode === 'challenge'
      ? `${(state.timeLeft / CHALLENGE_SECONDS) * 100}%`
      : `${((state.idx + 1) / state.count) * 100}%`;
    setTimeout(next, state.mode === 'challenge' ? 500 : 1400);
  } else {
    // ❌ 答错
    state.wrongs.push({ a: q.a, b: q.b, op: q.op, form: q.form, answer: q.answer, wrong: value });
    content.textContent = value;
    box.classList.add('wrong');
    optionEl.style.visibility = 'hidden';
    sfx.wrong();
    setMood('sad');

    if (state.mode === 'challenge') {
      // 挑战模式：快速跳过，不打断节奏
      setTimeout(next, 650);
    } else {
      speak('这道题你应该会的啊，要不要看看解析呢？');
      $('#question-bubble').textContent = '要不要看看解析呢？🤔';
      showExplain(q);
    }
  }
}

function showExplain(q) {
  const panel = $('#explain-panel');
  const stepsEl = $('#explain-steps');
  const actionsEl = $('#explain-actions');
  const continueBtn = $('#btn-continue');
  const titleEl = $('#explain-title');
  const showBtn = $('#btn-show-explain');
  const skipBtn = $('#btn-skip');
  const { title, steps } = buildExplanation(q);

  // 第一阶段：火龙先问，不自动展开解析
  titleEl.textContent = '💬 小火龙想对你说';
  stepsEl.innerHTML = '';
  actionsEl.classList.remove('hidden');
  continueBtn.classList.add('hidden');
  panel.classList.remove('hidden');

  const close = () => {
    panel.classList.add('hidden');
    $('#progress-fill').style.width = `${((state.idx + 1) / state.count) * 100}%`;
    next();
  };

  const onContinue = () => {
    continueBtn.removeEventListener('click', onContinue);
    close();
  };

  const onShow = () => {
    // 用户选择要看解析 → 展开分步讲解
    showBtn.removeEventListener('click', onShow);
    skipBtn.removeEventListener('click', onSkip);
    titleEl.textContent = `🔍 ${title}`;
    stepsEl.innerHTML = '';
    steps.forEach((s, i) => {
      const div = document.createElement('div');
      div.className = `explain-step${s.final ? ' final' : ''}`;
      div.style.animationDelay = `${0.2 + i * 0.55}s`;
      div.innerHTML = `<span class="step-icon">${s.icon}</span>
        <span class="step-text">${s.text} ${s.math ? `<span class="step-math">${s.math}</span>` : ''}</span>`;
      stepsEl.appendChild(div);
    });
    actionsEl.classList.add('hidden');
    continueBtn.classList.remove('hidden');
    continueBtn.addEventListener('click', onContinue);
    speak('一起来看解析吧！');
  };

  const onSkip = () => {
    // 不想看解析 → 直接继续
    showBtn.removeEventListener('click', onShow);
    skipBtn.removeEventListener('click', onSkip);
    close();
  };

  showBtn.addEventListener('click', onShow);
  skipBtn.addEventListener('click', onSkip);
}

function next() {
  state.idx++;
  if (state.idx >= state.count) finish();
  else renderQuestion();
}

// ---------- 结算 ----------
async function finish() {
  clearInterval(state.timerId);
  state.timerId = null;

  const isChallenge = state.mode === 'challenge';
  const total = isChallenge ? Math.max(state.idx, state.correct) : state.count;
  const accuracy = state.correct / Math.max(total, 1);
  const stars = isChallenge
    ? (state.correct >= 20 ? 3 : state.correct >= 12 ? 2 : state.correct >= 6 ? 1 : 0)
    : (accuracy >= 0.9 ? 3 : accuracy >= 0.8 ? 2 : accuracy >= 0.6 ? 1 : 0);

  // 写入本地存储：错题本 / 统计 / 星星（答对10题=1⭐）/ 打卡
  const stageBefore = getStage();
  const { bonus, streakDays, starsEarned } = recordQuizResult({
    module: state.module, level: state.level,
    correct: state.correct, total, wrongs: state.wrongs,
  });
  const stageAfter = getStage();

  showScreen('result');
  $('#result-title').textContent = isChallenge
    ? (stars >= 2 ? '口算王驾到！👑' : '挑战结束！')
    : stars >= 2 ? '太棒啦！' : stars === 1 ? '做得不错！' : '继续加油！';
  $('#result-stars').innerHTML = [1, 2, 3].map(i =>
    `<span class="star" style="filter:${i <= stars ? '' : 'grayscale(1) opacity(0.35)'}">⭐</span>`
  ).join('');
  $('#result-accuracy').textContent = isChallenge
    ? `1 分钟答对 ${state.correct} 题`
    : `答对 ${state.correct} / ${total} 题（${Math.round(accuracy * 100)}%）`;
  $('#result-msg').textContent = `本次答对 ${state.correct} 题，获得 ${starsEarned} ⭐（答对10题=1星）` +
    (bonus ? '，今日首次完成星星翻倍！' : '') +
    ` 已连续打卡 ${streakDays} 天 🔥`;

  // 错题重做按钮
  const redoBtn = $('#btn-redo-wrong');
  redoBtn.classList.toggle('hidden', state.wrongs.length === 0);
  redoBtn.textContent = `📖 重做错题（${state.wrongs.length} 题）`;
  redoBtn.onclick = () => startQuiz({
    questions: questionsFromWrongs(state.wrongs),
    mode: 'normal',
  });

  // 挑战模式：生成可分享战绩卡
  const cardCanvas = $('#share-card');
  const downloadBtn = $('#btn-download-card');
  if (isChallenge) {
    cardCanvas.classList.remove('hidden');
    downloadBtn.classList.remove('hidden');
    drawShareCard(cardCanvas, { correct: state.correct, stars, module: state.module, level: state.level });
    downloadBtn.onclick = () => {
      const a = document.createElement('a');
      a.href = cardCanvas.toDataURL('image/png');
      a.download = `口算王战绩卡_${state.correct}题.png`;
      a.click();
    };
    sfx.fanfare();
    speak(state.correct >= 12 ? '太厉害了，你就是口算王！' : '不错的成绩，再来挑战一次吧！');
  } else {
    cardCanvas.classList.add('hidden');
    downloadBtn.classList.add('hidden');
  }

  // 🎉 星级进化：星星累计到新等级 → 进化演出（普通/挑战模式通用）
  if (stageAfter > stageBefore) {
    await new Promise(r => setTimeout(r, 600));
    await playEvolution((t) => playFX(t, 3600));
  } else if (accuracy >= 0.8 || (isChallenge && state.correct >= 12)) {
    // 未进化也庆祝：随机火/冰大特效（爆炸音效 + 屏幕震动已内置）
    playFX(Math.random() < 0.5 ? 'fire' : 'ice', 3600);
    sfx.fanfare();
    speak('恭喜你又变强了！');
  }

  if (!isChallenge) {
    if (stageAfter > stageBefore) {
      $('#result-msg').textContent += ` 你的小火龙进化成「${STAGES[stageAfter].name}」啦！`;
    } else if (accuracy >= 0.6 && accuracy < 0.8) {
      $('#result-msg').textContent += ' 离进化只差一点点，下次一定行！';
    } else if (accuracy < 0.6) {
      $('#result-msg').textContent += ' 多练习几次，小火龙相信你！';
    }
  }
}

/** 绘制可分享的战绩卡 */
function drawShareCard(canvas, { correct, stars, module, level }) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // 背景渐变
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#aee6ff');
  bg.addColorStop(1, '#fff3c4');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 圆角白卡
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 30, 30, W - 60, H - 60, 30);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#e64a19';
  ctx.font = 'bold 44px "Microsoft YaHei", sans-serif';
  ctx.fillText('🔥 1分钟口算王 🔥', W / 2, 100);

  ctx.fillStyle = '#42a5f5';
  ctx.font = 'bold 26px "Microsoft YaHei", sans-serif';
  ctx.fillText(`${MODULE_NAMES[module] || module} · ${level} 以内`, W / 2, 145);

  ctx.fillStyle = '#ff7043';
  ctx.font = 'bold 110px "Microsoft YaHei", sans-serif';
  ctx.fillText(String(correct), W / 2, 270);
  ctx.fillStyle = '#7b5e57';
  ctx.font = '26px "Microsoft YaHei", sans-serif';
  ctx.fillText('题 答对', W / 2, 305);

  ctx.font = '40px sans-serif';
  ctx.fillText('⭐'.repeat(stars) + '☆'.repeat(3 - stars), W / 2, 350);

  ctx.fillStyle = '#9e9e9e';
  ctx.font = '18px "Microsoft YaHei", sans-serif';
  const date = new Date().toLocaleDateString('zh-CN');
  ctx.fillText(`${date} · 小火龙数学进化论 MathDragon Evolution`, W / 2, 400);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
