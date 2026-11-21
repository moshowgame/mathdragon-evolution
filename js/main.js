// 入口：页面路由与设置页逻辑

import { startQuiz, quitQuiz } from './quiz.js';
import { questionsFromWrongs } from './questions.js';
import { initDragon } from './dragon.js';
import { initMusic } from './music.js';
import { renderReport } from './report.js';
import { getHomeStats } from './storage.js';
import { sfx } from './audio.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const MODULE_TITLES = { add: '➕ 加法城堡', sub: '➖ 减法森林', mult: '✖️ 乘法高塔', div: '➗ 除法海岛', eq: '⚖️ 方程王国' };

const setup = { module: null, level: null, count: 10, mode: 'normal' };

function init() {
  initDragon();
  initMusic();
  renderHomeStats();

  // 首页：选择模块（加/减/乘/除）
  $$('.module-card').forEach(card => {
    card.addEventListener('click', () => {
      setup.module = card.dataset.module;
      setup.level = null;
      setup.mode = 'normal';
      $('#btn-start').disabled = true;
      $('#setup-title').textContent = MODULE_TITLES[setup.module];
      $('#count-block').classList.remove('hidden');
      $$('#level-grid .level-card').forEach(l => l.classList.remove('selected'));
      $$('#count-grid .count-pill').forEach(p => p.classList.toggle('selected', p.dataset.count === '10'));
      showScreen('setup');
      sfx.pickup();
    });
  });

  // 1分钟口算王
  $('#btn-challenge').addEventListener('click', () => {
    setup.module = 'add'; // 默认加法口算，可切难度
    setup.level = null;
    setup.mode = 'challenge';
    $('#btn-start').disabled = true;
    $('#setup-title').textContent = '⏱️ 1分钟口算王';
    $('#count-block').classList.add('hidden');
    $$('#level-grid .level-card').forEach(l => l.classList.remove('selected'));
    showScreen('setup');
    sfx.pickup();
  });

  // 学习乐园
  $('#btn-learn').addEventListener('click', async () => {
    showScreen('learn');
    sfx.pickup();
    const { initLearn } = await import('./learn.js');
    initLearn();
  });
  $('#btn-back-learn').addEventListener('click', () => {
    renderHomeStats();
    showScreen('home');
  });

  // 家长报告
  $('#btn-report').addEventListener('click', () => {
    renderReport();
    showScreen('report');
    sfx.pickup();
  });
  $('#btn-back-report').addEventListener('click', () => {
    renderHomeStats();
    showScreen('home');
  });

  // 重做错题（从报告页）
  $('#btn-redo-wrongs').addEventListener('click', () => {
    const wrongs = renderReport();
    if (!wrongs.length) return;
    startQuiz({
      questions: questionsFromWrongs(wrongs),
      module: 'add', level: 10, count: wrongs.length, mode: 'normal',
    });
  });

  // 返回首页
  $('#btn-back-home').addEventListener('click', () => showScreen('home'));

  // 选择难度
  $$('#level-grid .level-card').forEach(card => {
    card.addEventListener('click', () => {
      setup.level = Number(card.dataset.level);
      $$('#level-grid .level-card').forEach(l => l.classList.remove('selected'));
      card.classList.add('selected');
      $('#btn-start').disabled = false;
      sfx.pickup();
    });
  });

  // 选择题数（默认 10）
  $$('#count-grid .count-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      setup.count = Number(pill.dataset.count);
      $$('#count-grid .count-pill').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      sfx.pickup();
    });
  });

  // 开始答题
  $('#btn-start').addEventListener('click', () => {
    if (!setup.module || !setup.level) return;
    startQuiz({ module: setup.module, level: setup.level, count: setup.count, mode: setup.mode });
  });

  // 答题页退出
  $('#btn-quit').addEventListener('click', () => {
    quitQuiz();
    renderHomeStats();
    showScreen('home');
  });

  // 结果页按钮
  $('#btn-retry').addEventListener('click', () => {
    startQuiz({ module: setup.module, level: setup.level, count: setup.count, mode: setup.mode });
  });
  $('#btn-home').addEventListener('click', () => {
    renderHomeStats();
    showScreen('home');
  });
}

/** 渲染首页顶部：星星 / 连续打卡 */
function renderHomeStats() {
  const { totalStars, streakDays, dailyDone } = getHomeStats();
  $('#home-stats').innerHTML = `
    <span class="stat-chip">⭐ ${totalStars} 颗星星</span>
    <span class="stat-chip">🔥 连续 ${streakDays} 天</span>
    <span class="stat-chip ${dailyDone ? 'done' : 'todo'}">${dailyDone ? '✅ 今日已打卡' : '⏳ 今日还没打卡'}</span>
  `;
}

function showScreen(name) {
  $$('.screen').forEach(s => s.classList.add('hidden'));
  $(`#screen-${name}`).classList.remove('hidden');
  window.scrollTo(0, 0);
}

init();
