// 学习乐园：加减乘除与简单方程的分步动画解析（教学演示）

import { buildExplanation } from './explain.js';
import { sfx } from './audio.js';

const $ = (sel) => document.querySelector(sel);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

let currentOp = 'add';
let timers = [];
let inited = false;

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
      // 表内乘法
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

/** 渲染一步（带入场动画） */
function renderSteps(exp) {
  const { title, steps } = buildExplanation(exp);
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
  import('./audio.js').then((a) => a.speak(`我们一起来学：${title}`));
}

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

function play() {
  clearTimers();
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
      play();
    });
  });
  $('#learn-next').addEventListener('click', () => { sfx.pickup(); play(); });
  $('#learn-replay').addEventListener('click', () => { sfx.pickup(); play(); });
}
