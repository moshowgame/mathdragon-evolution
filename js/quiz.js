// 答题流程：拖拽作答、音效语音反馈、错题解析、结算与进化

import { generateQuestions } from './questions.js';
import { buildExplanation } from './explain.js';
import { sfx, speak, PRAISE, ENCOURAGE } from './audio.js';
import { setMood, playFX, playEvolution, getStage } from './dragon.js';

const $ = (sel) => document.querySelector(sel);

const state = {
  module: 'add',
  level: 10,
  count: 10,
  questions: [],
  idx: 0,
  correct: 0,
  locked: false,
};

export function startQuiz(config) {
  Object.assign(state, config, { idx: 0, correct: 0, locked: false });
  state.questions = generateQuestions(state.module, state.level, state.count);
  showScreen('quiz');
  renderQuestion();
}

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  $(`#screen-${name}`).classList.remove('hidden');
}

function renderQuestion() {
  const q = state.questions[state.idx];
  state.locked = false;

  $('#num-a').textContent = q.a;
  $('#num-op').textContent = q.op;
  $('#num-b').textContent = q.b;
  $('#answer-content').textContent = '?';
  const box = $('#answer-box');
  box.className = 'answer-box';
  $('#question-bubble').textContent = `第 ${state.idx + 1} 题：把正确答案拖到盒子里吧！`;
  $('#progress-text').textContent = `${state.idx + 1} / ${state.count}`;
  $('#progress-fill').style.width = `${(state.idx / state.count) * 100}%`;
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

  const q = state.questions[state.idx];
  const box = $('#answer-box');
  const content = $('#answer-content');

  if (value === q.answer) {
    // ✅ 答对
    state.correct++;
    $('#score-num').textContent = state.correct;
    content.textContent = value;
    box.classList.add('correct');
    optionEl.classList.add('is-correct-reveal');
    document.querySelectorAll('.option').forEach(o => { if (o !== optionEl) o.classList.add('faded'); });
    sfx.correct();
    speak(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
    setMood('happy');
    playFX('confetti', 1300);
    $('#question-bubble').textContent = pick(['哇！答对啦！', '太厉害了！', '你真棒！']);
    $('#progress-fill').style.width = `${((state.idx + 1) / state.count) * 100}%`;
    setTimeout(next, 1400);
  } else {
    // ❌ 答错 → 展示解析
    content.textContent = value;
    box.classList.add('wrong');
    optionEl.style.visibility = 'hidden';
    sfx.wrong();
    speak(ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]);
    setMood('sad');
    $('#question-bubble').textContent = '没关系，看看解析就知道啦～';
    showExplain(q);
  }
}

function showExplain(q) {
  const panel = $('#explain-panel');
  const stepsEl = $('#explain-steps');
  const { title, steps } = buildExplanation(q);
  $('#explain-panel .explain-title').textContent = `🔍 ${title}`;

  stepsEl.innerHTML = '';
  steps.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = `explain-step${s.final ? ' final' : ''}`;
    div.style.animationDelay = `${0.3 + i * 0.55}s`;
    div.innerHTML = `<span class="step-icon">${s.icon}</span>
      <span class="step-text">${s.text} ${s.math ? `<span class="step-math">${s.math}</span>` : ''}</span>`;
    stepsEl.appendChild(div);
  });

  panel.classList.remove('hidden');

  const btn = $('#btn-continue');
  const handler = () => {
    btn.removeEventListener('click', handler);
    panel.classList.add('hidden');
    $('#progress-fill').style.width = `${((state.idx + 1) / state.count) * 100}%`;
    next();
  };
  btn.addEventListener('click', handler);
}

function next() {
  state.idx++;
  if (state.idx >= state.count) finish();
  else renderQuestion();
}

// ---------- 结算 ----------
async function finish() {
  const total = state.count;
  const accuracy = state.correct / total;
  const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.8 ? 2 : accuracy >= 0.6 ? 1 : 0;

  showScreen('result');
  $('#result-title').textContent = stars >= 2 ? '太棒啦！' : stars === 1 ? '做得不错！' : '继续加油！';
  $('#result-stars').innerHTML = [1, 2, 3].map(i =>
    `<span class="star" style="filter:${i <= stars ? '' : 'grayscale(1) opacity(0.35)'}">⭐</span>`
  ).join('');
  $('#result-accuracy').textContent = `答对 ${state.correct} / ${total} 题（${Math.round(accuracy * 100)}%）`;

  if (accuracy >= 0.8) {
    $('#result-msg').textContent = getStage() < 2 ? '小火龙正在进化…' : '火龙能量再次爆发！';
    await new Promise(r => setTimeout(r, 600));
    if (getStage() < 2) {
      await playEvolution((t) => playFX(t, 3600));
    } else {
      // 已进化：随机冰火特效庆祝
      const t = Math.random() < 0.5 ? 'fire' : 'ice';
      playFX(t, 3600);
      sfx.fanfare();
      speak('恭喜你又变强了！');
    }
    $('#result-msg').textContent = getStage() >= 2 ? '你的小火龙已进化为翼火龙，继续变强吧！' : $('#result-msg').textContent;
  } else if (accuracy >= 0.6) {
    $('#result-msg').textContent = '离进化只差一点点，下次一定行！';
  } else {
    $('#result-msg').textContent = '多练习几次，小火龙相信你！';
  }
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
