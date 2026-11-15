// 入口：页面路由与设置页逻辑

import { startQuiz } from './quiz.js';
import { initDragon } from './dragon.js';
import { initMusic } from './music.js';
import { sfx } from './audio.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const setup = { module: null, level: null, count: 10 };

function init() {
  initDragon();
  initMusic();

  // 首页：选择加法 / 减法模块
  $$('.module-card').forEach(card => {
    card.addEventListener('click', () => {
      setup.module = card.dataset.module;
      setup.level = null;
      $('#btn-start').disabled = true;
      $('#setup-title').textContent = setup.module === 'add' ? '➕ 加法城堡' : '➖ 减法森林';
      $$('#level-grid .level-card').forEach(l => l.classList.remove('selected'));
      $$('#count-grid .count-pill').forEach(p => p.classList.toggle('selected', p.dataset.count === '10'));
      showScreen('setup');
      sfx.pickup();
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
    startQuiz({ module: setup.module, level: setup.level, count: setup.count });
  });

  // 答题页退出
  $('#btn-quit').addEventListener('click', () => showScreen('home'));

  // 结果页按钮
  $('#btn-retry').addEventListener('click', () => {
    startQuiz({ module: setup.module, level: setup.level, count: setup.count });
  });
  $('#btn-home').addEventListener('click', () => showScreen('home'));
}

function showScreen(name) {
  $$('.screen').forEach(s => s.classList.add('hidden'));
  $(`#screen-${name}`).classList.remove('hidden');
  window.scrollTo(0, 0);
}

init();
