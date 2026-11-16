// 小火龙吉祥物：五阶龙族形态、情绪动画、进化演出、超夸张全屏冰火特效
// 进化由星星驱动（答对 10 题 = 1 ⭐），星级越高形态越强、体型越大

import { getHomeStats } from './storage.js';

/** 五阶龙族等级表：need = 进化所需累计星星 */
export const STAGES = [
  { name: '小火龙', need: 0, scale: 1.0, body: '#ff9d5c', stroke: '#e64a19', belly: '#ffe0b2', horn: '#ffe0b2', wings: false, crown: false, aura: null, golden: false, cute: true },
  { name: '火恐龙', need: 3, scale: 1.16, body: '#ff7043', stroke: '#bf360c', belly: '#ffccbc', horn: '#ffe0b2', wings: false, crown: false, aura: null, golden: false, cute: false },
  { name: '翼火龙', need: 6, scale: 1.3, body: '#ff814a', stroke: '#d84315', belly: '#ffe0b2', horn: '#ffe0b2', wings: true, crown: false, aura: null, golden: false, cute: false },
  { name: '烈焰龙王', need: 10, scale: 1.44, body: '#ff5722', stroke: '#bf360c', belly: '#ffccbc', horn: '#ffe0b2', wings: true, crown: true, aura: 'rgba(255,110,30,0.4)', golden: false, cute: false },
  { name: '圣光龙王', need: 15, scale: 1.58, body: '#ffb74d', stroke: '#e65100', belly: '#fff3e0', horn: '#fff8e1', wings: true, crown: true, aura: 'rgba(255,215,64,0.5)', golden: true, cute: false },
];

/** 由累计星星计算当前形态等级 */
export function getStage() {
  const stars = getHomeStats().totalStars;
  let stage = 0;
  STAGES.forEach((s, i) => { if (stars >= s.need) stage = i; });
  return stage;
}

const dragonEl = () => document.getElementById('dragon');

/** 参数化五阶 SVG 形象 */
export function dragonSVG(stage = 0) {
  const s = STAGES[Math.max(0, Math.min(stage, STAGES.length - 1))];
  const flame = s.golden
    ? '#fff8e1,#ffd54f,#ff8f00'
    : '#fff176,#ffa726,#ef5350';
  const wingGrad = s.golden
    ? '<stop offset="0%" stop-color="#ffe082"/><stop offset="100%" stop-color="#ff8f00"/>'
    : '<stop offset="0%" stop-color="#4dd0e1"/><stop offset="100%" stop-color="#00838f"/>';
  const wingStroke = s.golden ? '#e65100' : '#006064';
  const flameDur = 2.4 - s.scale * 0.25; // 越高级火苗越快越旺
  const flameAmp = 1 + s.scale * 0.12;
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
    <circle cx="72" cy="6" r="3.5" fill="#ef5350"/>` : '';
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
    <circle cx="60" cy="61" r="4" fill="#4e342e"/>
    <circle cx="86" cy="61" r="4" fill="#4e342e"/>
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
        <stop offset="0%" stop-color="${flame.split(',')[0]}"/><stop offset="55%" stop-color="${flame.split(',')[1]}"/><stop offset="100%" stop-color="${flame.split(',')[2]}"/>
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

/** 根据当前形态调整火龙体积（星星越多越大） */
function applyDragonSize(el) {
  const { scale, name, need } = STAGES[getStage()];
  el.style.width = `${Math.round(130 * scale)}px`;
  el.style.height = `${Math.round(150 * scale)}px`;
  el.title = `${name}（累计 ${need} ⭐ 进化）`;
}

// ---------- 大招次数 ----------
/** 大招（超夸张冰火特效）：开局 0 次；每答对 10 题 +2 次（答 20 题以上的轮次翻倍为 +4） */
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

  // 🔥 大招按钮：释放超夸张冰火特效（消耗 1 次）
  const badge = document.getElementById('dragon-ult');
  badge?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (away || ultCharges <= 0) return;
    import('./audio.js').then((audio) => {
      ultCharges--;
      updateUltBadge();
      setMood('happy');
      const fxType = Math.random() < 0.5 ? 'fire' : 'ice'; // 音效与震动在 playFX 内置
      playFX(fxType, 2600);
      audio.speak(fxType === 'fire'
        ? `吼——${STAGES[getStage()].name}的超级火焰大招！`
        : `嗷呜——${STAGES[getStage()].name}的冰冻世界大招！`);
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
  const clear = () => el.classList.remove(mood);
  if (mood === 'happy') setTimeout(clear, 700);
  else setTimeout(clear, 700);
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

      overlay.querySelector('.evo-text').textContent = `🎉 恭喜进化成「${info.name}」！体型也变大啦！🎉`;
      audio.sfx.fanfare();
      audio.speak(`恭喜你，进化成${info.name}啦！体型也变大啦！`);
      await wait(1500);

      overlay.remove();

      // 随机全屏特效：火 或 冰
      onFx?.(Math.random() < 0.5 ? 'fire' : 'ice');
      resolve();
    });
  });
}

/** 全屏粒子特效：fire 火焰喷发 / ice 冰雪纷飞 / breath 火龙喷火 / confetti 彩带 */
export function playFX(type, duration = 3200) {
  const canvas = document.getElementById('fx-canvas');
  const ctx2d = canvas.getContext('2d');
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  canvas.style.display = 'block';

  // 冰火全屏特效：开局闪光 + 更强更久的屏幕震动 + 轰鸣音效
  const isBigFX = type === 'fire' || type === 'ice';
  let shakeTimer = null;
  if (isBigFX) {
    document.body.classList.remove('fx-shake');
    void document.body.offsetWidth;
    document.body.classList.add('fx-shake');
    shakeTimer = setTimeout(() => document.body.classList.remove('fx-shake'), 1200);
    duration = Math.max(duration, 4600);
    // 内置音效：火→爆炸轰鸣，冰→冰晶闪烁
    import('./audio.js').then((audio) => {
      if (type === 'fire') { audio.sfx.boom(); audio.sfx.fire(); }
      else audio.sfx.ice();
    });
  }

  // 喷火特效：以火龙嘴为发射点，持续喷射
  const breathOrigin = { x: 0, y: 0 };
  if (type === 'breath') {
    const rect = dragonEl().getBoundingClientRect();
    breathOrigin.x = rect.left + rect.width * 0.42;
    breathOrigin.y = rect.top + rect.height * 0.3;
  }

  const parts = [];
  const N = type === 'confetti' ? 80 : type === 'breath' ? 90 : 420;

  const spawn = (i) => {
    if (type === 'fire') {
      // 火焰：底部大片喷发 + 漂浮火星，更大更猛
      const big = Math.random() < 0.4;
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + rand(10, 120),
        vx: rand(-3.4, 3.4), vy: big ? rand(-19, -10) : rand(-10, -4),
        size: big ? rand(26, 64) : rand(12, 28), life: rand(60, 140), age: 0,
        hue: rand(4, 54), kind: 'fire',
      };
    }
    if (type === 'ice') {
      // 冰晶：大小雪花漫天飞舞，更大更密
      const big = Math.random() < 0.35;
      return {
        x: Math.random() * canvas.width,
        y: -rand(20, 180),
        vx: rand(-2.2, 2.2), vy: big ? rand(1.4, 3.6) : rand(3, 7),
        size: big ? rand(20, 44) : rand(7, 15), life: rand(160, 280), age: 0,
        hue: rand(172, 218), kind: 'ice', spin: rand(-0.14, 0.14), angle: Math.random() * Math.PI,
      };
    }
    if (type === 'breath') {
      // 从火龙嘴里向左上方喷出
      return {
        x: breathOrigin.x + rand(-8, 8),
        y: breathOrigin.y + rand(-8, 8),
        vx: rand(-7.5, -1.5), vy: rand(-9, -2),
        size: rand(9, 24), life: rand(30, 60), age: 0,
        hue: rand(10, 50), kind: 'fire',
      };
    }
    return {
      x: Math.random() * canvas.width, y: -20,
      vx: rand(-1.5, 1.5), vy: rand(2, 5),
      size: rand(5, 11), life: rand(90, 160), age: 0,
      color: ['#ef5350', '#ffca28', '#66bb6a', '#42a5f5', '#ab47bc'][i % 5],
      kind: 'confetti', spin: rand(-0.2, 0.2), angle: Math.random() * Math.PI,
    };
  };

  for (let i = 0; i < N; i++) parts.push(spawn(i));

  // 冲击波圆环（火/冰特效专属）：从屏幕中心层层扩散
  const rings = [];
  if (isBigFX) {
    rings.push({ r: 0, maxR: Math.hypot(canvas.width, canvas.height) / 2, born: 0 });
    rings.push({ r: 0, maxR: Math.hypot(canvas.width, canvas.height) / 2, born: 420 });
    rings.push({ r: 0, maxR: Math.hypot(canvas.width, canvas.height) / 2, born: 900 });
  }

  let raf;
  const start = performance.now();
  if (activeRaf) cancelAnimationFrame(activeRaf); // 并发保护：新特效接管画布

  function frame(now) {
    const elapsed = now - start;
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);

    // 开场全屏闪光（冰/火氛围光），更大更亮
    if (isBigFX && elapsed < 1100) {
      const alpha = 0.95 * (1 - elapsed / 1100);
      const flashColor = type === 'fire' ? '255,130,30' : '140,215,255';
      const flash = ctx2d.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width * 0.95);
      flash.addColorStop(0, `rgba(${flashColor}, ${alpha})`);
      flash.addColorStop(1, `rgba(${flashColor}, 0)`);
      ctx2d.fillStyle = flash;
      ctx2d.fillRect(0, 0, canvas.width, canvas.height);
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
      ctx2d.arc(canvas.width / 2, canvas.height / 2, ring.r, 0, Math.PI * 2);
      ctx2d.stroke();
    }

    // 喷火：喷射期间不断补充新火苗
    if (type === 'breath' && elapsed < 900) {
      for (let i = 0; i < 5; i++) parts.push(spawn(i));
    }

    for (const p of parts) {
      p.age++;
      p.x += p.vx; p.y += p.vy;
      if (p.kind === 'fire') { p.vy += 0.06; p.vx *= 0.99; p.size *= 0.985; }
      if (p.kind === 'ice') { p.x += Math.sin(p.age * 0.05) * 1.2; p.angle += p.spin; }
      if (p.kind === 'confetti') { p.vy += 0.05; p.angle += p.spin; }

      const alpha = Math.max(0, 1 - p.age / p.life);
      if (p.kind === 'fire') {
        const g = ctx2d.createRadialGradient(p.x, p.y, 0, p.x, p.y, Math.max(p.size, 1));
        g.addColorStop(0, `hsla(${p.hue}, 100%, 68%, ${alpha})`);
        g.addColorStop(0.55, `hsla(${p.hue}, 100%, 55%, ${alpha * 0.8})`);
        g.addColorStop(1, `hsla(${p.hue - 12}, 100%, 45%, 0)`);
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
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
      cancelAnimationFrame(raf);
      activeRaf = null;
      clearTimeout(shakeTimer);
      document.body.classList.remove('fx-shake');
    }
  }
  raf = requestAnimationFrame(frame);
  activeRaf = raf;
}

const rand = (min, max) => Math.random() * (max - min) + min;
const wait = (ms) => new Promise(r => setTimeout(r, ms));
let activeRaf = null;
