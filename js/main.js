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

  // 首页：选择模块（加/减/乘/除/方程/拼音）
  $$('.module-card').forEach(card => {
    card.addEventListener('click', () => {
      if (card.dataset.module === 'py') {
        // 拼音王国：独立玩法页
        showScreen('pinyin');
        sfx.pickup();
        import('./pinyin.js').then(m => m.initPinyin());
        return;
      }
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

  // 拼音王国：返回首页 + 游戏内返回按钮
  $('#btn-back-py').addEventListener('click', () => {
    renderHomeStats();
    showScreen('home');
  });
  document.addEventListener('py:home', () => {
    renderHomeStats();
    showScreen('home');
  });

  // ---------- 收藏到桌面（PWA 安装） ----------
  const btnInstall = $('#btn-install');
  let deferredPrompt = null;

  /** 是否已作为应用运行（安装成功后浏览器进入独立窗口模式） */
  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  /** 决定按钮是否显示：已安装 / 已安装过 / 已关闭引导 → 隐藏，防止重复收藏 */
  function refreshInstallBtn() {
    const installed = localStorage.getItem('pwa_installed') === '1';
    const dismissed = localStorage.getItem('pwa_dismissed') === '1';
    btnInstall.classList.toggle('hidden', isStandalone() || installed || dismissed);
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    refreshInstallBtn();
  });
  window.addEventListener('appinstalled', () => {
    localStorage.setItem('pwa_installed', '1');
    deferredPrompt = null;
    refreshInstallBtn();
  });

  btnInstall.addEventListener('click', async () => {
    sfx.pickup();
    if (deferredPrompt) {
      // 支持 PWA 安装提示的浏览器（Chrome/Edge/Android）：唤起系统安装框
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') localStorage.setItem('pwa_installed', '1');
      deferredPrompt = null;
      refreshInstallBtn();
      return;
    }
    // iOS Safari / 其他浏览器：显示手动添加步骤
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    $('#install-steps').innerHTML = isIOS
      ? '<p>1️⃣ 点击底部工具栏的 <strong>分享按钮</strong> <span style="font-size:20px">⬆️</span></p><p>2️⃣ 往下滑，找到 <strong>「添加到主屏幕」</strong></p><p>3️⃣ 点 <strong>「添加」</strong>，桌面就会出现小火龙啦！</p>'
      : '<p>1️⃣ 点击浏览器地址栏右侧的 <strong>安装图标</strong>（或菜单里的「安装应用 / 添加到主屏幕」）</p><p>2️⃣ 确认安装，桌面就有小火龙的图标啦！</p>';
    $('#install-modal').classList.remove('hidden');
  });

  $('#install-close').addEventListener('click', () => {
    // 关闭引导后不再打扰（避免重复弹窗）
    localStorage.setItem('pwa_dismissed', '1');
    $('#install-modal').classList.add('hidden');
    refreshInstallBtn();
  });

  refreshInstallBtn();
  matchMedia('(display-mode: standalone)').addEventListener?.('change', refreshInstallBtn);

  // 注册 Service Worker（离线可用；仅 https / localhost 生效）
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* 静默 */ });
  }

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
