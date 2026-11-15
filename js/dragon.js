// 小火龙吉祥物：SVG 形象、情绪动画、进化演出、全屏冰火特效

const STORAGE_KEY = 'mathdragon_stage';
export const getStage = () => Number(localStorage.getItem(STORAGE_KEY) || 1);
export const setStage = (s) => localStorage.setItem(STORAGE_KEY, String(s));

const dragonEl = () => document.getElementById('dragon');

/** 两阶段 SVG 形象：1 小火龙 / 2 翼火龙 */
export function dragonSVG(stage = 1) {
  if (stage >= 2) return dragonStage2();
  return dragonStage1();
}

function dragonStage1() {
  return `
  <svg viewBox="0 0 130 150" aria-label="小火龙">
    <defs>
      <radialGradient id="flame1" cx="50%" cy="70%" r="60%">
        <stop offset="0%" stop-color="#fff176"/><stop offset="55%" stop-color="#ffa726"/><stop offset="100%" stop-color="#ef5350"/>
      </radialGradient>
    </defs>
    <!-- 尾巴 + 火苗 -->
    <path d="M88 118 Q118 128 112 100" fill="none" stroke="#ff9d5c" stroke-width="13" stroke-linecap="round"/>
    <path d="M112 100 Q120 88 110 72 Q116 88 104 94 Q112 80 106 70 Q118 82 114 98 Q118 106 112 100 Z" fill="url(#flame1)">
      <animate attributeName="opacity" values="1;0.7;1" dur="0.8s" repeatCount="indefinite"/>
    </path>
    <!-- 身体 -->
    <ellipse cx="62" cy="104" rx="34" ry="30" fill="#ff9d5c" stroke="#e64a19" stroke-width="3"/>
    <ellipse cx="62" cy="112" rx="20" ry="17" fill="#ffe0b2"/>
    <!-- 小手小脚 -->
    <circle cx="34" cy="102" r="8" fill="#ff9d5c" stroke="#e64a19" stroke-width="3"/>
    <circle cx="90" cy="102" r="8" fill="#ff9d5c" stroke="#e64a19" stroke-width="3"/>
    <ellipse cx="50" cy="134" rx="11" ry="7" fill="#ff9d5c" stroke="#e64a19" stroke-width="3"/>
    <ellipse cx="76" cy="134" rx="11" ry="7" fill="#ff9d5c" stroke="#e64a19" stroke-width="3"/>
    <!-- 头 -->
    <circle cx="62" cy="62" r="30" fill="#ff9d5c" stroke="#e64a19" stroke-width="3"/>
    <!-- 角 -->
    <path d="M48 38 Q44 26 52 22 Q50 32 56 36 Z" fill="#ffe0b2" stroke="#e64a19" stroke-width="2"/>
    <path d="M76 38 Q80 26 72 22 Q74 32 68 36 Z" fill="#ffe0b2" stroke="#e64a19" stroke-width="2"/>
    <!-- 眼睛 -->
    <g class="dragon-eyes">
      <circle cx="51" cy="58" r="8" fill="#fff"/>
      <circle cx="73" cy="58" r="8" fill="#fff"/>
      <circle class="pupil" cx="52" cy="59" r="4.5" fill="#4e342e"/>
      <circle class="pupil" cx="74" cy="59" r="4.5" fill="#4e342e"/>
      <circle cx="50" cy="56" r="1.6" fill="#fff"/>
      <circle cx="72" cy="56" r="1.6" fill="#fff"/>
    </g>
    <!-- 嘴 -->
    <g class="dragon-mouth">
      <path d="M55 74 Q62 80 69 74" fill="none" stroke="#b71c1c" stroke-width="2.5" stroke-linecap="round"/>
    </g>
    <!-- 腮红 -->
    <ellipse cx="42" cy="68" rx="5" ry="3" fill="#ffab91" opacity="0.8"/>
    <ellipse cx="82" cy="68" rx="5" ry="3" fill="#ffab91" opacity="0.8"/>
  </svg>`;
}

function dragonStage2() {
  return `
  <svg viewBox="0 0 150 160" aria-label="翼火龙">
    <defs>
      <radialGradient id="flame2" cx="50%" cy="70%" r="60%">
        <stop offset="0%" stop-color="#fff176"/><stop offset="55%" stop-color="#ffa726"/><stop offset="100%" stop-color="#ef5350"/>
      </radialGradient>
      <linearGradient id="wing" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#4dd0e1"/><stop offset="100%" stop-color="#00838f"/>
      </linearGradient>
    </defs>
    <!-- 翅膀 -->
    <path d="M108 78 Q140 48 136 34 Q128 58 112 66 Q132 52 128 36 Q120 60 104 72 Z" fill="url(#wing)" stroke="#006064" stroke-width="2.5"/>
    <path d="M42 78 Q10 48 14 34 Q22 58 38 66 Q18 52 22 36 Q30 60 46 72 Z" fill="url(#wing)" stroke="#006064" stroke-width="2.5"/>
    <!-- 尾巴 + 大火苗 -->
    <path d="M92 122 Q126 134 118 100" fill="none" stroke="#ff814a" stroke-width="14" stroke-linecap="round"/>
    <path d="M118 100 Q130 84 118 62 Q128 82 112 90 Q122 74 114 60 Q132 76 124 98 Q130 108 118 100 Z" fill="url(#flame2)">
      <animate attributeName="opacity" values="1;0.65;1" dur="0.6s" repeatCount="indefinite"/>
    </path>
    <!-- 身体 -->
    <ellipse cx="72" cy="108" rx="36" ry="32" fill="#ff814a" stroke="#d84315" stroke-width="3"/>
    <ellipse cx="72" cy="116" rx="21" ry="18" fill="#ffe0b2"/>
    <circle cx="42" cy="104" r="8" fill="#ff814a" stroke="#d84315" stroke-width="3"/>
    <circle cx="102" cy="104" r="8" fill="#ff814a" stroke="#d84315" stroke-width="3"/>
    <ellipse cx="60" cy="140" rx="12" ry="7" fill="#ff814a" stroke="#d84315" stroke-width="3"/>
    <ellipse cx="86" cy="140" rx="12" ry="7" fill="#ff814a" stroke="#d84315" stroke-width="3"/>
    <!-- 头 -->
    <circle cx="72" cy="62" r="31" fill="#ff814a" stroke="#d84315" stroke-width="3"/>
    <!-- 长角 -->
    <path d="M54 36 Q48 18 58 12 Q56 26 64 34 Z" fill="#ffe0b2" stroke="#d84315" stroke-width="2"/>
    <path d="M90 36 Q96 18 86 12 Q88 26 80 34 Z" fill="#ffe0b2" stroke="#d84315" stroke-width="2"/>
    <!-- 眼睛（英气一点） -->
    <g class="dragon-eyes">
      <path d="M52 54 Q60 50 66 56" fill="none" stroke="#bf360c" stroke-width="3" stroke-linecap="round"/>
      <path d="M78 56 Q84 50 92 54" fill="none" stroke="#bf360c" stroke-width="3" stroke-linecap="round"/>
      <circle cx="59" cy="60" r="7" fill="#fff"/>
      <circle cx="85" cy="60" r="7" fill="#fff"/>
      <circle cx="60" cy="61" r="4" fill="#4e342e"/>
      <circle cx="86" cy="61" r="4" fill="#4e342e"/>
      <circle cx="58" cy="58" r="1.4" fill="#fff"/>
      <circle cx="84" cy="58" r="1.4" fill="#fff"/>
    </g>
    <!-- 嘴 -->
    <g class="dragon-mouth">
      <path d="M64 76 Q72 84 80 76" fill="none" stroke="#b71c1c" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M66 79 Q72 83 78 79" fill="none" stroke="#b71c1c" stroke-width="1.5" stroke-linecap="round"/>
    </g>
    <ellipse cx="50" cy="70" rx="5" ry="3" fill="#ff7043" opacity="0.8"/>
    <ellipse cx="94" cy="70" rx="5" ry="3" fill="#ff7043" opacity="0.8"/>
  </svg>`;
}

/** 初始化吉祥物 */
export function initDragon() {
  const el = dragonEl();
  el.innerHTML = dragonSVG(getStage());
  el.addEventListener('click', () => {
    setMood('happy');
    import('./audio.js').then(m => m.speak(`我是${getStage() >= 2 ? '翼火龙' : '小火龙'}，答题帮我进化吧！`));
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

/** 进化演出（返回 Promise，结束后展示结果页） */
export function playEvolution(onFx) {
  return new Promise((resolve) => {
    const el = dragonEl();
    const overlay = document.createElement('div');
    overlay.className = 'evolution-overlay';
    const before = getStage();
    const after = 2;

    overlay.innerHTML = `
      <div class="evo-dragon" id="evo-dragon">${dragonSVG(before)}</div>
      <div class="evo-text">✨ 进化中… ✨</div>
    `;
    document.body.appendChild(overlay);

    import('./audio.js').then(async (audio) => {
      audio.sfx.evolve();
      await wait(1500);

      // 白光爆发 → 换形象
      const inner = overlay.querySelector('#evo-dragon');
      inner.classList.add('evolved');
      await wait(400);
      inner.innerHTML = dragonSVG(after);
      setStage(after);
      el.innerHTML = dragonSVG(after);

      overlay.querySelector('.evo-text').textContent = '🎉 恭喜你又变强了！🎉';
      audio.sfx.fanfare();
      audio.speak('恭喜你又变强了！');
      await wait(1200);

      overlay.remove();

      // 随机全屏特效：火 或 冰
      const fxType = Math.random() < 0.5 ? 'fire' : 'ice';
      onFx?.(fxType);
      resolve();
    });
  });
}

/** 全屏粒子特效：fire 火焰喷发 / ice 冰雪纷飞 / confetti 彩带 */
export function playFX(type, duration = 3200) {
  const canvas = document.getElementById('fx-canvas');
  const ctx2d = canvas.getContext('2d');
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  canvas.style.display = 'block';

  const parts = [];
  const N = type === 'confetti' ? 80 : 140;

  for (let i = 0; i < N; i++) {
    if (type === 'fire') {
      parts.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 20,
        vx: rand(-1, 1), vy: rand(-9, -4),
        size: rand(6, 16), life: rand(50, 110), age: 0,
        hue: rand(10, 50), kind: 'fire',
      });
    } else if (type === 'ice') {
      parts.push({
        x: Math.random() * canvas.width,
        y: -20,
        vx: rand(-1.2, 1.2), vy: rand(1.5, 4),
        size: rand(4, 10), life: rand(120, 220), age: 0,
        hue: rand(180, 210), kind: 'ice', spin: rand(-0.1, 0.1), angle: Math.random() * Math.PI,
      });
    } else {
      parts.push({
        x: Math.random() * canvas.width, y: -20,
        vx: rand(-1.5, 1.5), vy: rand(2, 5),
        size: rand(5, 11), life: rand(90, 160), age: 0,
        color: ['#ef5350', '#ffca28', '#66bb6a', '#42a5f5', '#ab47bc'][i % 5],
        kind: 'confetti', spin: rand(-0.2, 0.2), angle: Math.random() * Math.PI,
      });
    }
  }

  let raf;
  const start = performance.now();

  function frame(now) {
    const elapsed = now - start;
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of parts) {
      p.age++;
      p.x += p.vx; p.y += p.vy;
      if (p.kind === 'fire') { p.vy += 0.06; p.vx *= 0.99; }
      if (p.kind === 'ice') { p.x += Math.sin(p.age * 0.05) * 0.8; p.angle += p.spin; }
      if (p.kind === 'confetti') { p.vy += 0.05; p.angle += p.spin; }

      const alpha = Math.max(0, 1 - p.age / p.life);
      if (p.kind === 'fire') {
        const g = ctx2d.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        g.addColorStop(0, `hsla(${p.hue}, 100%, 65%, ${alpha})`);
        g.addColorStop(1, `hsla(${p.hue - 10}, 100%, 50%, 0)`);
        ctx2d.fillStyle = g;
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx2d.fill();
      } else if (p.kind === 'ice') {
        ctx2d.save();
        ctx2d.translate(p.x, p.y);
        ctx2d.rotate(p.angle);
        ctx2d.fillStyle = `hsla(${p.hue}, 90%, 75%, ${alpha})`;
        ctx2d.strokeStyle = `hsla(${p.hue}, 90%, 55%, ${alpha})`;
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
    } else {
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
      cancelAnimationFrame(raf);
    }
  }
  raf = requestAnimationFrame(frame);
}

const rand = (min, max) => Math.random() * (max - min) + min;
const wait = (ms) => new Promise(r => setTimeout(r, ms));
