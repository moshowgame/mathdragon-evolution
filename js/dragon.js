// 小火龙吉祥物：20 阶龙族形态、情绪动画、进化演出、6 种全屏大招特效
// 进化由星星驱动（答对 10 题 = 1 ⭐），星级越高形态越强、体型越大

import { getHomeStats } from './storage.js';

/** 20 阶龙族等级表：need = 进化所需累计星星 */
export const STAGES = [
  { name: '小火龙',   need: 0,  scale: 1.00, body: '#ff9d5c', stroke: '#e64a19', belly: '#ffe0b2', horn: '#ffe0b2', flame: null,  wings: false, crown: false, aura: null,                        golden: false, cute: true },
  { name: '火恐龙',   need: 2,  scale: 1.08, body: '#ff7043', stroke: '#bf360c', belly: '#ffccbc', horn: '#ffe0b2', flame: null,  wings: false, crown: false, aura: null,                        golden: false, cute: false },
  { name: '翼火龙',   need: 4,  scale: 1.16, body: '#ff814a', stroke: '#d84315', belly: '#ffe0b2', horn: '#ffe0b2', flame: null,  wings: true,  crown: false, aura: null,                        golden: false, cute: false },
  { name: '烈焰龙',   need: 6,  scale: 1.24, body: '#ff5722', stroke: '#bf360c', belly: '#ffccbc', horn: '#ffe0b2', flame: null,  wings: true,  crown: false, aura: 'rgba(255,110,30,0.35)',     golden: false, cute: false },
  { name: '熔岩龙',   need: 9,  scale: 1.32, body: '#d84315', stroke: '#4e342e', belly: '#ffab91', horn: '#3e2723', flame: null,  wings: true,  crown: false, aura: 'rgba(255,60,0,0.4)',        golden: false, cute: false },
  { name: '蓝焰龙',   need: 12, scale: 1.40, body: '#42a5f5', stroke: '#1565c0', belly: '#bbdefb', horn: '#e1f5fe', flame: 'ice', wings: true,  crown: false, aura: 'rgba(70,160,255,0.4)',      golden: false, cute: false },
  { name: '雷鸣龙',   need: 15, scale: 1.48, body: '#ffee58', stroke: '#f57f17', belly: '#fff9c4', horn: '#fffde7', flame: null,  wings: true,  crown: false, aura: 'rgba(255,235,59,0.45)',     golden: false, cute: false },
  { name: '冰霜龙',   need: 18, scale: 1.56, body: '#80deea', stroke: '#00838f', belly: '#e0f7fa', horn: '#e0f7fa', flame: 'ice', wings: true,  crown: false, aura: 'rgba(130,220,255,0.45)',    golden: false, cute: false },
  { name: '风影龙',   need: 22, scale: 1.64, body: '#66bb6a', stroke: '#2e7d32', belly: '#c8e6c9', horn: '#e8f5e9', flame: null,  wings: true,  crown: false, aura: 'rgba(100,220,120,0.35)',    golden: false, cute: false },
  { name: '大地龙',   need: 26, scale: 1.72, body: '#a1887f', stroke: '#4e342e', belly: '#d7ccc8', horn: '#efebe9', flame: null,  wings: true,  crown: false, aura: 'rgba(160,120,90,0.4)',      golden: false, cute: false },
  { name: '暗夜龙',   need: 30, scale: 1.80, body: '#7e57c2', stroke: '#311b92', belly: '#d1c4e9', horn: '#ede7f6', flame: null,  wings: true,  crown: true,  aura: 'rgba(130,70,220,0.45)',     golden: false, cute: false },
  { name: '光明龙',   need: 34, scale: 1.88, body: '#fff8e1', stroke: '#f9a825', belly: '#ffffff', horn: '#ffd54f', flame: null,  wings: true,  crown: true,  aura: 'rgba(255,240,160,0.5)',     golden: true,  cute: false },
  { name: '星辰龙',   need: 38, scale: 1.96, body: '#5c6bc0', stroke: '#283593', belly: '#c5cae9', horn: '#e8eaf6', flame: null,  wings: true,  crown: true,  aura: 'rgba(100,110,255,0.45)',    golden: false, cute: false },
  { name: '月光龙',   need: 42, scale: 2.04, body: '#cfd8dc', stroke: '#546e7a', belly: '#ffffff', horn: '#eceff1', flame: 'ice', wings: true,  crown: true,  aura: 'rgba(200,220,240,0.5)',     golden: false, cute: false },
  { name: '日耀龙',   need: 46, scale: 2.12, body: '#ffb300', stroke: '#e65100', belly: '#fff3e0', horn: '#fff8e1', flame: null,  wings: true,  crown: true,  aura: 'rgba(255,180,40,0.55)',     golden: true,  cute: false },
  { name: '虹彩龙',   need: 50, scale: 2.20, body: '#ec407a', stroke: '#ad1457', belly: '#fce4ec', horn: '#f8bbd0', flame: null,  wings: true,  crown: true,  aura: 'rgba(255,100,180,0.5)',     golden: false, cute: false },
  { name: '铠甲龙',   need: 55, scale: 2.28, body: '#90a4ae', stroke: '#37474f', belly: '#cfd8dc', horn: '#eceff1', flame: null,  wings: true,  crown: true,  aura: 'rgba(150,180,200,0.45)',    golden: false, cute: false },
  { name: '幻影龙',   need: 60, scale: 2.36, body: '#9575cd', stroke: '#4527a0', belly: '#e6cef7', horn: '#f3e5f5', flame: null,  wings: true,  crown: true,  aura: 'rgba(180,120,255,0.5)',     golden: false, cute: false },
  { name: '混沌龙',   need: 66, scale: 2.44, body: '#ef5350', stroke: '#1a237e', belly: '#fff59d', horn: '#ffd54f', flame: null,  wings: true,  crown: true,  aura: 'rgba(255,80,80,0.5)',       golden: false, cute: false },
  { name: '龙神',     need: 72, scale: 2.52, body: '#ffd54f', stroke: '#e65100', belly: '#fffde7', horn: '#ffffff', flame: null,  wings: true,  crown: true,  aura: 'rgba(255,215,80,0.6)',      golden: true,  cute: false },
];

/** 由累计星星计算当前形态等级 */
export function getStage() {
  const stars = getHomeStats().totalStars;
  let stage = 0;
  STAGES.forEach((s, i) => { if (stars >= s.need) stage = i; });
  return stage;
}

const dragonEl = () => document.getElementById('dragon');

/** 参数化 20 阶 SVG 形象 */
export function dragonSVG(stage = 0) {
  const s = STAGES[Math.max(0, Math.min(stage, STAGES.length - 1))];
  const flame = s.golden
    ? '#fff8e1,#ffd54f,#ff8f00'
    : s.flame === 'ice'
      ? '#b3e5fc,#4fc3f7,#0277bd'
      : '#fff176,#ffa726,#ef5350';
  const [fc0, fc1, fc2] = flame.split(',');
  const wingGrad = s.golden
    ? '<stop offset="0%" stop-color="#ffe082"/><stop offset="100%" stop-color="#ff8f00"/>'
    : s.flame === 'ice'
      ? '<stop offset="0%" stop-color="#b3e5fc"/><stop offset="100%" stop-color="#0277bd"/>'
      : '<stop offset="0%" stop-color="#4dd0e1"/><stop offset="100%" stop-color="#00838f"/>';
  const wingStroke = s.golden ? '#e65100' : s.flame === 'ice' ? '#01579b' : '#006064';
  const flameDur = Math.max(2.4 - s.scale * 0.35, 1.4); // 越高级火苗越快越旺
  const flameAmp = 1 + s.scale * 0.14;
  const aura = s.aura ? `<ellipse cx="72" cy="88" rx="64" ry="66" fill="url(#auraG)"/>` : '';
  const auraDef = s.aura ? `<radialGradient id="auraG" cx="50%" cy="45%" r="55%"><stop offset="40%" stop-color="${s.aura}"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>` : '';
  const wings = s.wings ? `
    <path d="M108 78 Q142 46 138 30 Q128 56 112 66 Q134 50 130 32 Q120 58 104 72 Z" fill="url(#wing)" stroke="${wingStroke}" stroke-width="2.5"/>
    <path d="M36 78 Q2 46 6 30 Q16 56 32 66 Q10 50 14 32 Q24 58 40 72 Z" fill="url(#wing)" stroke="${wingStroke}" stroke-width="2.5"/>` : '';
  const horns = s.cute
    ? `<path d="M48 38 Q44 26 52 22 Q50 32 56 36 Z" fill="${s.horn}" stroke="${s.stroke}" stroke-width="2"/>
       <path d="M76 38 Q80 26 72 22 Q74 32 68 36 Z" fill="${s.horn}" stroke="${s.stroke}" stroke-width="2"/>`
    : `<path d="M54 36 Q46 16 58 10 Q56 26 64 34 Z" fill="${s.horn}" stroke="${s.stroke}" stroke-width="2"/>
       <path d="M90 36 Q98 16 86 10 Q88 26 80 34 Z" fill="${s.horn}" stroke="${s.stroke}" stroke-width="2"/>`;
  const crown = s.crown ? `
    <path d="M56 28 L60 12 L66 24 L72 8 L78 24 L84 12 L88 28 Q72 36 56 28 Z" fill="#ffd54f" stroke="#e65100" stroke-width="2.5"/>
    <circle cx="72" cy="6" r="3.5" fill="${s.golden ? '#4fc3f7' : '#ef5350'}"/>` : '';
  const eyes = s.cute ? `
    <circle cx="51" cy="58" r="8" fill="#fff"/>
    <circle cx="73" cy="58" r="8" fill="#fff"/>
    <circle class="pupil" cx="52" cy="59" r="4.5" fill="#4e342e"/>
    <circle class="pupil" cx="74" cy="59" r="4.5" fill="#4e342e"/>
    <circle cx="50" cy="56" r="1.6" fill="#fff"/>
    <circle cx="72" cy="56" r="1.6" fill="#fff"/>` : `
    <path d="M52 54 Q60 50 66 56" fill="none" stroke="${s.stroke}" stroke-width="3" stroke-linecap="round"/>
    <path d="M78 56 Q84 50 92 54" fill="none" stroke="${s.stroke}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="59" cy="60" r="7" fill="#fff"/>
    <circle cx="85" cy="60" r="7" fill="#fff"/>
    <circle cx="60" cy="61" r="4" fill="${s.golden ? '#bf360c' : '#4e342e'}"/>
    <circle cx="86" cy="61" r="4" fill="${s.golden ? '#bf360c' : '#4e342e'}"/>
    <circle cx="58" cy="58" r="1.4" fill="#fff"/>
    <circle cx="84" cy="58" r="1.4" fill="#fff"/>`;
  const mouth = s.cute
    ? `<path d="M55 74 Q62 80 69 74" fill="none" stroke="#b71c1c" stroke-width="2.5" stroke-linecap="round"/>`
    : `<path d="M64 76 Q72 84 80 76" fill="none" stroke="#b71c1c" stroke-width="2.5" stroke-linecap="round"/>
       <path d="M66 79 Q72 83 78 79" fill="none" stroke="#b71c1c" stroke-width="1.5" stroke-linecap="round"/>`;

  return `
  <svg viewBox="0 0 150 160" aria-label="${s.name}">
    <defs>
      <radialGradient id="flameG" cx="50%" cy="70%" r="60%">
        <stop offset="0%" stop-color="${fc0}"/><stop offset="55%" stop-color="${fc1}"/><stop offset="100%" stop-color="${fc2}"/>
      </radialGradient>
      <linearGradient id="wing" x1="0" y1="0" x2="1" y2="1">${wingGrad}</linearGradient>
      ${auraDef}
    </defs>
    ${aura}
    ${wings}
    <!-- 尾巴 + 火苗 -->
    <path d="M92 122 Q126 134 118 100" fill="none" stroke="${s.body}" stroke-width="14" stroke-linecap="round"/>
    <path d="M118 100 Q130 84 118 62 Q128 82 112 90 Q122 74 114 60 Q132 76 124 98 Q130 108 118 100 Z" fill="url(#flameG)">
      <animateTransform attributeName="transform" type="scale" additive="sum" values="1;${flameAmp};${flameAmp * 0.92};${flameAmp * 1.05};1" dur="${flameDur}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="1;0.8;0.88;0.75;1" dur="${flameDur}s" repeatCount="indefinite"/>
    </path>
    <!-- 身体 -->
    <ellipse cx="72" cy="108" rx="36" ry="32" fill="${s.body}" stroke="${s.stroke}" stroke-width="3"/>
    <ellipse cx="72" cy="116" rx="21" ry="18" fill="${s.belly}"/>
    <circle cx="42" cy="104" r="8" fill="${s.body}" stroke="${s.stroke}" stroke-width="3"/>
    <circle cx="102" cy="104" r="8" fill="${s.body}" stroke="${s.stroke}" stroke-width="3"/>
    <ellipse cx="60" cy="140" rx="12" ry="7" fill="${s.body}" stroke="${s.stroke}" stroke-width="3"/>
    <ellipse cx="86" cy="140" rx="12" ry="7" fill="${s.body}" stroke="${s.stroke}" stroke-width="3"/>
    <!-- 头 -->
    <circle cx="72" cy="62" r="31" fill="${s.body}" stroke="${s.stroke}" stroke-width="3"/>
    ${horns}
    ${crown}
    <g class="dragon-eyes">${eyes}</g>
    <g class="dragon-mouth">${mouth}</g>
    <ellipse cx="50" cy="70" rx="5" ry="3" fill="#ff7043" opacity="0.8"/>
    <ellipse cx="94" cy="70" rx="5" ry="3" fill="#ff7043" opacity="0.8"/>
  </svg>`;
}

/** 根据当前形态调整火龙体积（星星越多越大，手机端自动缩小） */
function applyDragonSize(el) {
  let { scale, name, need } = STAGES[getStage()];
  if (innerWidth < 640) scale *= 0.72;
  el.style.width = `${Math.round(130 * scale)}px`;
  el.style.height = `${Math.round(150 * scale)}px`;
  el.title = `${name}（累计 ${need} ⭐ 进化）`;
}

// ---------- 大招次数 ----------
/** 大招（6 种全屏特效）：开局 0 次；每答对 10 题 +2 次（答 20 题以上的轮次翻倍为 +4） */
let ultCharges = 0;
/** 答题页内连续点击次数（答完一题重置） */
let quizPokes = 0;
/** 火龙是否已离家出走 */
let away = false;
/** 🥚 彩蛋：双击偷大招的上一次点击时间与冷却 */
let lastClickAt = 0;
let lastEggGrantAt = 0;

/** 更新大招按钮显示（跟随火龙体型自动上移） */
function updateUltBadge() {
  const badge = document.getElementById('dragon-ult');
  if (!badge) return;
  badge.classList.toggle('hidden', ultCharges <= 0);
  badge.textContent = `🔥 大招 ×${ultCharges}`;
  const dragon = dragonEl();
  if (dragon) badge.style.bottom = `${dragon.offsetHeight + 24}px`;
}

/** 答对 10 题（20 题以上轮次翻倍）奖励大招次数 */
export function grantUlt(n) {
  ultCharges += n;
  updateUltBadge();
}

const isQuizActive = () => {
  const quiz = document.querySelector('#screen-quiz');
  return quiz && !quiz.classList.contains('hidden');
};

/** 答完一题后，火龙的耐心重置 */
export function resetPatience() {
  quizPokes = 0;
}

/** 火龙离家出走 20 秒 */
function leaveForWalk(el, audio) {
  away = true;
  quizPokes = 0;
  audio.speak('别烦我啦，我出去溜了拜拜～');
  el.classList.add('leaving');
  setTimeout(() => { el.style.display = 'none'; }, 1700);

  setTimeout(() => {
    el.style.display = '';
    el.classList.remove('leaving');
    void el.offsetWidth;
    el.classList.add('returning');
    audio.speak('我溜达回来啦，要继续认真做题哦！');
    setTimeout(() => {
      el.classList.remove('returning');
      away = false;
    }, 1600);
  }, 20000);
}

/** 初始化吉祥物 */
export function initDragon() {
  const el = dragonEl();
  el.innerHTML = dragonSVG(getStage());
  applyDragonSize(el);
  updateUltBadge();

  // 普通点击火龙：喷小火（不限次数）
  el.addEventListener('click', () => {
    if (away) return;
    import('./audio.js').then((audio) => {
      // 答题页捣乱判定：连点越来越不耐烦
      if (isQuizActive()) {
        quizPokes++;
        if (quizPokes >= 5) {
          leaveForWalk(el, audio);
          return;
        }
        if (quizPokes >= 3) {
          // 不耐烦：小小喷你一下火，劝你学习
          setMood('sad');
          audio.sfx.fire();
          playFX('breath', 1000);
          audio.speak(quizPokes === 3 ? '哎呀别闹啦，要认真做题哦！' : '再烦我，我可要出去溜达了哦！');
          return;
        }
      } else {
        quizPokes = 0;
      }

      // 🥚 彩蛋：快速连点两下火龙，偷偷获得 1 次大招（20 秒冷却防滥用）
      const now = Date.now();
      if (now - lastClickAt < 600) {
        if (now - lastEggGrantAt >= 20000) {
          lastEggGrantAt = now;
          ultCharges++;
          updateUltBadge();
          audio.speak('咦？被你发现啦！嘘——偷偷送你一次大招，别告诉别人哦！');
          playFX('confetti', 1200);
        } else {
          audio.speak('嘘～大招能量充能中，等20秒再偷偷点试试吧！');
        }
      }
      lastClickAt = now;

      setMood('happy');
      el.classList.remove('breathing');
      void el.offsetWidth;
      el.classList.add('breathing');
      setTimeout(() => el.classList.remove('breathing'), 1400);
      audio.sfx.fire();
      playFX('breath', 1600);
      const lines = ['呼——小火苗噗噗噗！', '看我的小火焰，暖和吧！', '小火花，哔啵哔啵！'];
      audio.speak(lines[Math.floor(Math.random() * lines.length)]);
      if (ultCharges > 0) {
        setTimeout(() => audio.speak(`我还有${ultCharges}次大招，点上面的🔥大招按钮试试吧！`), 2400);
      }
    });
  });

  // 🔥 大招按钮：随机释放 6 种全屏特效之一（消耗 1 次）
  const badge = document.getElementById('dragon-ult');
  badge?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (away || ultCharges <= 0) return;
    import('./audio.js').then((audio) => {
      ultCharges--;
      updateUltBadge();
      setMood('happy');
      const pick = ULT_TYPES[Math.floor(Math.random() * ULT_TYPES.length)];
      playFX(pick, 2600); // 音效与震动在 playFX 内置
      audio.speak(`吼——${STAGES[getStage()].name}的${ULT_NAMES[pick]}大招！`);
      if (ultCharges === 0) setTimeout(() => audio.speak('大招用完啦，答对10题就再送我2次哦！'), 3400);
    });
  });
}

/** 情绪动画：happy / sad */
export function setMood(mood) {
  const el = dragonEl();
  el.classList.remove('happy', 'sad');
  void el.offsetWidth; // 重新触发动画
  el.classList.add(mood);
  setTimeout(() => el.classList.remove(mood), 700);
}

/** 进化演出（quiz.js 记录星星后调用，自动进化到当前星级对应的形态） */
export function playEvolution(onFx) {
  return new Promise((resolve) => {
    const el = dragonEl();
    const target = getStage();
    const info = STAGES[target];
    const from = Math.max(target - 1, 0);

    const overlay = document.createElement('div');
    overlay.className = 'evolution-overlay';
    overlay.innerHTML = `
      <div class="evo-dragon" id="evo-dragon">${dragonSVG(from)}</div>
      <div class="evo-text">✨ ${info.name} 进化中… ✨</div>
    `;
    document.body.appendChild(overlay);

    import('./audio.js').then(async (audio) => {
      audio.sfx.evolve();
      await wait(1600);

      // 白光爆发 → 换形象 + 变大
      const inner = overlay.querySelector('#evo-dragon');
      inner.classList.add('evolved');
      await wait(450);
      inner.innerHTML = dragonSVG(target);
      el.innerHTML = dragonSVG(target);
      applyDragonSize(el);
      updateUltBadge();

      overlay.querySelector('.evo-text').textContent = `🎉 恭喜进化成「${info.name}」！体型也变大啦！🎉`;
      audio.sfx.fanfare();
      audio.speak(`恭喜你，进化成${info.name}啦！体型也变大啦！`);
      await wait(1500);

      overlay.remove();

      // 随机全屏大招特效
      onFx?.(ULT_TYPES[Math.floor(Math.random() * ULT_TYPES.length)]);
      resolve();
    });
  });
}

// ---------- 大招特效 ----------
/** 6 种大招类型与名称 */
export const ULT_TYPES = ['fire', 'ice', 'tornado', 'volcano', 'thunder', 'quake'];
export const ULT_NAMES = {
  fire: '超级火焰', ice: '冰冻世界', tornado: '超大龙卷风',
  volcano: '火山喷发', thunder: '电闪雷鸣', quake: '大地震怒',
};

/** 每种大招的闪光颜色 / 震动时长 / 音效 */
const FX_CONF = {
  fire:    { flash: '255,130,30',  shake: 1200, sound: null },
  ice:     { flash: '140,215,255', shake: 1200, sound: 'ice' },
  tornado: { flash: '200,205,215', shake: 1800, sound: 'tornado' },
  volcano: { flash: '255,90,20',   shake: 2000, sound: 'volcano' },
  thunder: { flash: '230,240,255', shake: 1600, sound: 'thunder' },
  quake:   { flash: null,          shake: 2600, sound: 'quake', heavy: true },
};

/** 全屏特效：fire 火焰 / ice 冰雪 / tornado 龙卷风 / volcano 火山 / thunder 闪电 / quake 地震 / breath 小火 / confetti 彩带 */
export function playFX(type, duration = 3200) {
  const canvas = document.getElementById('fx-canvas');
  const ctx2d = canvas.getContext('2d');
  const W = canvas.width = innerWidth;
  const H = canvas.height = innerHeight;
  canvas.style.display = 'block';

  const isBigFX = ULT_TYPES.includes(type);
  const conf = isBigFX ? FX_CONF[type] : null;
  let shakeTimer = null;
  if (conf) {
    const cls = conf.heavy ? 'fx-shake-heavy' : 'fx-shake';
    document.body.classList.remove('fx-shake', 'fx-shake-heavy');
    void document.body.offsetWidth;
    document.body.classList.add(cls);
    shakeTimer = setTimeout(() => document.body.classList.remove('fx-shake', 'fx-shake-heavy'), conf.shake);
    const minDur = { fire: 4600, ice: 4600, tornado: 4400, volcano: 4600, thunder: 4200, quake: 3400 };
    duration = Math.max(duration, minDur[type]);
    import('./audio.js').then((audio) => {
      if (type === 'fire') { audio.sfx.boom(); audio.sfx.fire(); }
      else audio.sfx[conf.sound]?.();
    });
  }

  // 喷火特效：以火龙嘴为发射点
  let breathOrigin = null;
  if (type === 'breath') {
    const rect = dragonEl().getBoundingClientRect();
    breathOrigin = { x: rect.left + rect.width * 0.42, y: rect.top + rect.height * 0.3 };
  }

  const parts = [];
  const N = type === 'confetti' ? 80 : type === 'breath' ? 90
    : type === 'tornado' ? 240 : type === 'quake' ? 110 : type === 'thunder' ? 36 : 420;

  const spawn = (i) => {
    switch (type) {
      case 'fire': {
        const big = Math.random() < 0.4;
        return { x: Math.random() * W, y: H + rand(10, 120), vx: rand(-3.4, 3.4), vy: big ? rand(-19, -10) : rand(-10, -4), size: big ? rand(26, 64) : rand(12, 28), life: rand(60, 140), age: 0, hue: rand(4, 54), kind: 'fire' };
      }
      case 'ice': {
        const big = Math.random() < 0.35;
        return { x: Math.random() * W, y: -rand(20, 180), vx: rand(-2.2, 2.2), vy: big ? rand(1.4, 3.6) : rand(3, 7), size: big ? rand(20, 44) : rand(7, 15), life: rand(160, 280), age: 0, hue: rand(172, 218), kind: 'ice', spin: rand(-0.14, 0.14), angle: Math.random() * Math.PI };
      }
      case 'tornado':
        return { kind: 'debris', x: 0, y: rand(H * 0.2, H), ang: Math.random() * Math.PI * 2, angVel: rand(0.16, 0.34), size: rand(4, 13), life: rand(100, 240), age: 0, hue: rand(180, 230), gray: Math.random() < 0.65 };
      case 'volcano': {
        const big = Math.random() < 0.5;
        return { x: W / 2 + rand(-W * 0.06, W * 0.06), y: H + 10, vx: rand(-8, 8), vy: big ? rand(-24, -14) : rand(-16, -9), size: big ? rand(18, 44) : rand(8, 18), life: rand(90, 180), age: 0, hue: rand(4, 45), kind: 'lava' };
      }
      case 'quake':
        return { x: Math.random() * W, y: -rand(10, 60), vx: rand(-1.2, 1.2), vy: rand(3, 7), size: rand(6, 16), life: rand(60, 140), age: 0, angle: Math.random() * Math.PI, spin: rand(-0.2, 0.2), kind: 'shard' };
      case 'thunder':
        return { x: Math.random() * W, y: -10, vx: rand(-1, 1), vy: rand(9, 15), size: rand(4, 9), life: rand(30, 60), age: 0, kind: 'rain' };
      case 'breath':
        return { x: breathOrigin.x + rand(-8, 8), y: breathOrigin.y + rand(-8, 8), vx: rand(-7.5, -1.5), vy: rand(-9, -2), size: rand(9, 24), life: rand(30, 60), age: 0, hue: rand(10, 50), kind: 'fire' };
      default:
        return { x: Math.random() * W, y: -20, vx: rand(-1.5, 1.5), vy: rand(2, 5), size: rand(5, 11), life: rand(90, 160), age: 0, color: ['#ef5350', '#ffca28', '#66bb6a', '#42a5f5', '#ab47bc'][i % 5], kind: 'confetti', spin: rand(-0.2, 0.2), angle: Math.random() * Math.PI };
    }
  };
  for (let i = 0; i < N; i++) parts.push(spawn(i));

  // 冲击波圆环（火/冰专属）
  const rings = [];
  if (type === 'fire' || type === 'ice') {
    for (const born of [0, 420, 900]) rings.push({ r: 0, maxR: Math.hypot(W, H) / 2, born });
  }

  // 闪电（雷鸣专属）：随机锯齿闪电束
  const bolts = [];
  let nextBolt = 80;
  const makeBolt = () => {
    let x = rand(W * 0.15, W * 0.85), y = 0;
    const pts = [[x, 0]];
    while (y < H * rand(0.55, 0.82)) { x += rand(-45, 45); y += rand(30, 80); pts.push([x, y]); }
    const branches = [];
    const nb = 2 + Math.floor(Math.random() * 3);
    for (let b = 0; b < nb; b++) {
      const from = pts[1 + Math.floor(Math.random() * (pts.length - 2))];
      let bx = from[0], by = from[1];
      const br = [[bx, by]];
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (let st = 0; st < 3; st++) { bx += dir * rand(20, 60); by += rand(15, 50); br.push([bx, by]); }
      branches.push(br);
    }
    return { pts, branches, age: 0, life: rand(140, 240) };
  };

  // 玻璃裂纹（地震专属）：从随机中心放射的蛛网裂纹
  const cracks = [];
  if (type === 'quake') {
    for (let c = 0; c < 3; c++) {
      const cx = W * (0.22 + Math.random() * 0.56), cy = H * (0.22 + Math.random() * 0.5);
      const segs = [];
      const arms = 7 + Math.floor(Math.random() * 5);
      for (let a = 0; a < arms; a++) {
        const ang = (Math.PI * 2 / arms) * a + rand(-0.25, 0.25);
        let x = cx, y = cy, cur = ang;
        const steps = 4 + Math.floor(Math.random() * 5);
        for (let st = 0; st < steps; st++) {
          const len = rand(28, 95);
          cur += rand(-0.4, 0.4);
          const nx = x + Math.cos(cur) * len, ny = y + Math.sin(cur) * len;
          segs.push([x, y, nx, ny]);
          x = nx; y = ny;
        }
      }
      cracks.push({ cx, cy, segs, born: c * 450 });
    }
  }

  // 龙卷风漏斗几何
  const funnel = type === 'tornado'
    ? { cx: W * 0.5, topY: H * 0.1, botY: H, maxR: Math.min(W * 0.34, 330), rot: 0 }
    : null;
  const funnelR = (y) => {
    const t = (y - funnel.topY) / (funnel.botY - funnel.topY);
    return Math.max(funnel.maxR * Math.pow(Math.max(t, 0), 1.25), 18);
  };

  let raf;
  const start = performance.now();
  if (activeRaf) cancelAnimationFrame(activeRaf); // 并发保护：新特效接管画布

  function frame(now) {
    const elapsed = now - start;
    ctx2d.clearRect(0, 0, W, H);

    // 开场全屏闪光（大招氛围光）
    if (conf && conf.flash && elapsed < 1100) {
      const alpha = 0.95 * (1 - elapsed / 1100);
      const flash = ctx2d.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.95);
      flash.addColorStop(0, `rgba(${conf.flash}, ${alpha})`);
      flash.addColorStop(1, `rgba(${conf.flash}, 0)`);
      ctx2d.fillStyle = flash;
      ctx2d.fillRect(0, 0, W, H);
    }

    // 冲击波圆环
    for (const ring of rings) {
      const t = (elapsed - ring.born) / 900;
      if (t < 0 || t > 1) continue;
      ring.r = ring.maxR * (1 - Math.pow(1 - t, 2));
      ctx2d.strokeStyle = type === 'fire'
        ? `rgba(255,150,50,${0.7 * (1 - t)})`
        : `rgba(150,220,255,${0.7 * (1 - t)})`;
      ctx2d.lineWidth = 14 * (1 - t) + 2;
      ctx2d.beginPath();
      ctx2d.arc(W / 2, H / 2, ring.r, 0, Math.PI * 2);
      ctx2d.stroke();
    }

    // 火山：底部岩浆光 + 持续喷发
    if (type === 'volcano') {
      const g = ctx2d.createLinearGradient(0, H * 0.72, 0, H);
      g.addColorStop(0, 'rgba(255,80,10,0)');
      g.addColorStop(1, `rgba(255,120,20,${0.45 + 0.25 * Math.sin(elapsed / 140)})`);
      ctx2d.fillStyle = g;
      ctx2d.fillRect(0, H * 0.72, W, H * 0.28);
      if (elapsed < duration - 800) for (let i = 0; i < 6; i++) parts.push(spawn(i));
    }

    // 龙卷风：旋转漏斗 + 持续补充碎屑
    if (funnel) {
      funnel.rot += 0.09;
      const segsN = 14;
      for (let s2 = 0; s2 < segsN; s2++) {
        const y = funnel.topY + (funnel.botY - funnel.topY) * (s2 / segsN);
        const r = funnelR(y) * (1 + 0.12 * Math.sin(elapsed / 90 + s2));
        const off = funnel.rot + s2 * 0.55;
        ctx2d.strokeStyle = `rgba(170,178,195,${0.3 - s2 * 0.014})`;
        ctx2d.lineWidth = Math.max(26 * (1 - s2 / segsN) + 6, 4);
        ctx2d.beginPath();
        ctx2d.ellipse(funnel.cx + Math.sin(off * 2) * 6, y, r, r * 0.32, off * 0.35, 0, Math.PI * 2);
        ctx2d.stroke();
      }
      if (elapsed < duration - 600) for (let i = 0; i < 3; i++) parts.push(spawn(i));
    }

    // 闪电：随机劈下锯齿闪电束 + 白光频闪
    if (type === 'thunder') {
      if (elapsed > nextBolt) {
        nextBolt = elapsed + rand(220, 480);
        bolts.push(makeBolt());
        document.body.classList.remove('fx-shake', 'fx-shake-heavy');
        void document.body.offsetWidth;
        document.body.classList.add('fx-shake');
        clearTimeout(shakeTimer);
        shakeTimer = setTimeout(() => document.body.classList.remove('fx-shake', 'fx-shake-heavy'), 900);
      }
      let boltFlash = 0;
      for (const b of bolts) {
        b.age++;
        if (b.age > b.life) continue;
        const a = 1 - b.age / b.life;
        boltFlash = Math.max(boltFlash, 0.5 * a);
        ctx2d.save();
        ctx2d.strokeStyle = `rgba(255,255,255,${a})`;
        ctx2d.shadowColor = `rgba(140,180,255,${a})`;
        ctx2d.shadowBlur = 24;
        ctx2d.lineWidth = 5;
        ctx2d.beginPath();
        b.pts.forEach(([x, y], idx) => (idx ? ctx2d.lineTo(x, y) : ctx2d.moveTo(x, y)));
        ctx2d.stroke();
        ctx2d.lineWidth = 2;
        for (const br of b.branches) {
          ctx2d.beginPath();
          br.forEach(([x, y], idx) => (idx ? ctx2d.lineTo(x, y) : ctx2d.moveTo(x, y)));
          ctx2d.stroke();
        }
        ctx2d.restore();
      }
      if (bolts.length > 10) bolts.splice(0, bolts.length - 10);
      if (boltFlash > 0) {
        ctx2d.fillStyle = `rgba(235,242,255,${boltFlash * 0.45})`;
        ctx2d.fillRect(0, 0, W, H);
      }
    }

    // 地震：渐次显现的玻璃蛛网裂纹
    if (type === 'quake') {
      ctx2d.save();
      ctx2d.strokeStyle = 'rgba(250,250,255,0.9)';
      ctx2d.shadowColor = 'rgba(180,200,255,0.8)';
      ctx2d.shadowBlur = 8;
      for (const cr of cracks) {
        const t = Math.min((elapsed - cr.born) / 500, 1);
        if (t <= 0) continue;
        const showN = Math.ceil(cr.segs.length * t);
        ctx2d.lineWidth = 3;
        ctx2d.beginPath();
        for (let s3 = 0; s3 < showN; s3++) {
          const [x1, y1, x2, y2] = cr.segs[s3];
          ctx2d.moveTo(x1, y1);
          ctx2d.lineTo(x2, y2);
        }
        ctx2d.stroke();
      }
      ctx2d.restore();
    }

    // 喷火：喷射期间不断补充新火苗
    if (type === 'breath' && elapsed < 900) {
      for (let i = 0; i < 5; i++) parts.push(spawn(i));
    }

    for (const p of parts) {
      p.age++;
      const alpha = Math.max(0, 1 - p.age / p.life);

      if (p.kind === 'debris') {
        // 龙卷风碎屑：绕漏斗轴螺旋上升
        p.y -= rand(0.6, 2.2);
        p.ang += p.angVel;
        const r = funnelR(Math.max(p.y, funnel.topY)) * rand(0.75, 1.15);
        p.x = funnel.cx + Math.cos(p.ang) * r;
        ctx2d.fillStyle = p.gray
          ? `rgba(125,132,148,${alpha})`
          : `hsla(${p.hue}, 60%, 72%, ${alpha})`;
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx2d.fill();
        if (p.y < funnel.topY + 8) p.age = p.life;
        continue;
      }

      p.x += p.vx; p.y += p.vy;
      if (p.kind === 'fire') { p.vy += 0.06; p.vx *= 0.99; p.size *= 0.985; }
      else if (p.kind === 'lava') { p.vy += 0.35; p.size *= 0.995; }
      else if (p.kind === 'ice') { p.x += Math.sin(p.age * 0.05) * 1.2; p.angle += p.spin; }
      else if (p.kind === 'shard') { p.vy += 0.25; p.angle += p.spin; }
      else if (p.kind === 'confetti') { p.vy += 0.05; p.angle += p.spin; }

      if (p.kind === 'fire' || p.kind === 'lava') {
        const g = ctx2d.createRadialGradient(p.x, p.y, 0, p.x, p.y, Math.max(p.size, 1));
        if (p.kind === 'fire') {
          g.addColorStop(0, `hsla(${p.hue}, 100%, 68%, ${alpha})`);
          g.addColorStop(0.55, `hsla(${p.hue}, 100%, 55%, ${alpha * 0.8})`);
          g.addColorStop(1, `hsla(${p.hue - 12}, 100%, 45%, 0)`);
        } else {
          g.addColorStop(0, `hsla(${p.hue}, 100%, 62%, ${alpha})`);
          g.addColorStop(0.5, `hsla(${p.hue + 10}, 95%, 48%, ${alpha * 0.85})`);
          g.addColorStop(1, 'rgba(60,10,0,0)');
        }
        ctx2d.fillStyle = g;
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, Math.max(p.size, 1), 0, Math.PI * 2);
        ctx2d.fill();
      } else if (p.kind === 'ice') {
        ctx2d.save();
        ctx2d.translate(p.x, p.y);
        ctx2d.rotate(p.angle);
        ctx2d.fillStyle = `hsla(${p.hue}, 90%, 78%, ${alpha})`;
        ctx2d.strokeStyle = `hsla(${p.hue}, 90%, 52%, ${alpha})`;
        ctx2d.lineWidth = 2;
        ctx2d.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI / 3) * k;
          ctx2d.lineTo(Math.cos(a) * p.size, Math.sin(a) * p.size);
        }
        ctx2d.closePath();
        ctx2d.fill();
        ctx2d.stroke();
        ctx2d.restore();
      } else if (p.kind === 'shard') {
        // 玻璃碎片：半透明小三角
        ctx2d.save();
        ctx2d.translate(p.x, p.y);
        ctx2d.rotate(p.angle);
        ctx2d.fillStyle = `rgba(200,225,255,${alpha * 0.85})`;
        ctx2d.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx2d.lineWidth = 1.5;
        ctx2d.beginPath();
        ctx2d.moveTo(0, -p.size);
        ctx2d.lineTo(p.size * 0.7, p.size * 0.6);
        ctx2d.lineTo(-p.size * 0.7, p.size * 0.5);
        ctx2d.closePath();
        ctx2d.fill();
        ctx2d.stroke();
        ctx2d.restore();
      } else if (p.kind === 'rain') {
        ctx2d.strokeStyle = `rgba(180,205,240,${alpha * 0.8})`;
        ctx2d.lineWidth = 1.5;
        ctx2d.beginPath();
        ctx2d.moveTo(p.x, p.y);
        ctx2d.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
        ctx2d.stroke();
      } else {
        ctx2d.save();
        ctx2d.translate(p.x, p.y);
        ctx2d.rotate(p.angle);
        ctx2d.globalAlpha = alpha;
        ctx2d.fillStyle = p.color;
        ctx2d.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        ctx2d.restore();
      }
    }

    if (elapsed < duration) {
      raf = requestAnimationFrame(frame);
      activeRaf = raf;
    } else {
      ctx2d.clearRect(0, 0, W, H);
      canvas.style.display = 'none';
      cancelAnimationFrame(raf);
      activeRaf = null;
      clearTimeout(shakeTimer);
      document.body.classList.remove('fx-shake', 'fx-shake-heavy');
    }
  }
  raf = requestAnimationFrame(frame);
  activeRaf = raf;
}

const rand = (min, max) => Math.random() * (max - min) + min;
const wait = (ms) => new Promise(r => setTimeout(r, ms));
let activeRaf = null;
