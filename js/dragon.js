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
      <animateTransform attributeName="transform" type="scale" additive="sum" values="1;1.12;1.04;1.15;1" dur="2.2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="1;0.82;0.9;0.78;1" dur="2.2s" repeatCount="indefinite"/>
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
      <animateTransform attributeName="transform" type="scale" additive="sum" values="1;1.18;1.05;1.22;1" dur="1.8s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="1;0.8;0.88;0.75;1" dur="1.8s" repeatCount="indefinite"/>
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

/** 点击喷火剩余次数（每次进页面重置，最多 3 次） */
let puffsLeft = 3;
/** 答题页内连续点击次数（答完一题重置） */
let quizPokes = 0;
/** 火龙是否已离家出走 */
let away = false;

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

      // 平时点击：限量喷火
      if (puffsLeft > 0) {
        puffsLeft--;
        setMood('happy');
        el.classList.remove('breathing');
        void el.offsetWidth;
        el.classList.add('breathing');
        setTimeout(() => el.classList.remove('breathing'), 1400);
        audio.sfx.fire();
        playFX('breath', 1800);
        const lines = ['吼——超级火焰攻击！', '看我的大火苗，嗷呜！', '哇，火力全开，好热好热！'];
        audio.speak(lines[Math.min(2 - puffsLeft, 2)] || lines[0]);
        if (puffsLeft === 0) setTimeout(() => audio.speak('火力用完啦，答对80%让我进化再喷吧！'), 2600);
      } else {
        setMood('sad');
        audio.speak('小火龙累了，让我休息一下才能继续喷火哦～');
      }
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

/** 全屏粒子特效：fire 火焰喷发 / ice 冰雪纷飞 / breath 火龙喷火 / confetti 彩带 */
export function playFX(type, duration = 3200) {
  const canvas = document.getElementById('fx-canvas');
  const ctx2d = canvas.getContext('2d');
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  canvas.style.display = 'block';

  // 冰火全屏特效：开局闪光 + 屏幕震动，更加夸张
  const isBigFX = type === 'fire' || type === 'ice';
  let shakeTimer = null;
  if (isBigFX) {
    document.body.classList.remove('fx-shake');
    void document.body.offsetWidth;
    document.body.classList.add('fx-shake');
    shakeTimer = setTimeout(() => document.body.classList.remove('fx-shake'), 800);
    duration = Math.max(duration, 4200);
  }

  // 喷火特效：以火龙嘴为发射点，持续喷射
  const breathOrigin = { x: 0, y: 0 };
  if (type === 'breath') {
    const rect = dragonEl().getBoundingClientRect();
    breathOrigin.x = rect.left + rect.width * 0.42;
    breathOrigin.y = rect.top + rect.height * 0.3;
  }

  const parts = [];
  const N = type === 'confetti' ? 80 : type === 'breath' ? 90 : 260;

  const spawn = (i) => {
    if (type === 'fire') {
      // 火焰：底部大片喷发 + 漂浮火星
      const big = Math.random() < 0.3;
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + rand(10, 80),
        vx: rand(-2.4, 2.4), vy: big ? rand(-14, -8) : rand(-8, -3),
        size: big ? rand(18, 42) : rand(8, 20), life: rand(60, 130), age: 0,
        hue: rand(8, 52), kind: 'fire',
      };
    }
    if (type === 'ice') {
      // 冰晶：大小雪花漫天飞舞
      const big = Math.random() < 0.25;
      return {
        x: Math.random() * canvas.width,
        y: -rand(20, 140),
        vx: rand(-1.6, 1.6), vy: big ? rand(1, 3) : rand(2.5, 6),
        size: big ? rand(14, 30) : rand(5, 12), life: rand(150, 260), age: 0,
        hue: rand(175, 215), kind: 'ice', spin: rand(-0.12, 0.12), angle: Math.random() * Math.PI,
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

  let raf;
  const start = performance.now();
  if (activeRaf) cancelAnimationFrame(activeRaf); // 并发保护：新特效接管画布

  function frame(now) {
    const elapsed = now - start;
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);

    // 开场全屏闪光（冰/火氛围光）
    if (isBigFX && elapsed < 900) {
      const alpha = 0.85 * (1 - elapsed / 900);
      const flashColor = type === 'fire' ? '255,140,40' : '150,220,255';
      const flash = ctx2d.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width * 0.8);
      flash.addColorStop(0, `rgba(${flashColor}, ${alpha})`);
      flash.addColorStop(1, `rgba(${flashColor}, 0)`);
      ctx2d.fillStyle = flash;
      ctx2d.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 喷火：喷射期间不断补充新火苗
    if (type === 'breath' && elapsed < 900) {
      for (let i = 0; i < 5; i++) parts.push(spawn(i));
    }

    for (const p of parts) {
      p.age++;
      p.x += p.vx; p.y += p.vy;
      if (p.kind === 'fire') { p.vy += 0.06; p.vx *= 0.99; p.size *= 0.985; }
      if (p.kind === 'ice') { p.x += Math.sin(p.age * 0.05) * 1.1; p.angle += p.spin; }
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
