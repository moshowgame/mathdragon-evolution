// 音效 + 语音模块：WebAudio 合成音效，speechSynthesis 中文语音表扬

let ctx = null;

export function ensureCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** 播放一串音符 */
function playNotes(freqs, { type = 'sine', dur = 0.18, gap = 0.12, vol = 0.35 } = {}) {
  try {
    const ac = ensureCtx();
    const t0 = ac.currentTime;
    freqs.forEach((f, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.value = f;
      const start = t0 + i * gap;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain).connect(ac.destination);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    });
  } catch { /* 音频不可用时静默 */ }
}

export const sfx = {
  pickup: () => playNotes([660], { dur: 0.08, vol: 0.2 }),
  correct: () => playNotes([523, 659, 784, 1047], { dur: 0.22, gap: 0.11, vol: 0.4 }),
  wrong: () => playNotes([220, 180], { type: 'triangle', dur: 0.28, gap: 0.18, vol: 0.3 }),
  evolve: () => playNotes([392, 523, 659, 784, 1047, 1319], { dur: 0.3, gap: 0.12, vol: 0.45 }),
  fanfare: () => playNotes([784, 784, 784, 1047], { dur: 0.25, gap: 0.16, vol: 0.4 }),
  // 喷火：由高到低的锯齿波呼啸声
  fire: () => playNotes([980, 740, 560, 420, 320], { type: 'sawtooth', dur: 0.28, gap: 0.09, vol: 0.22 }),
  // 爆炸轰鸣：低频下坠 + 噪声爆发（冰火大特效用）
  boom: () => {
    try {
      const ac = ensureCtx();
      const t0 = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, t0);
      osc.frequency.exponentialRampToValueAtTime(40, t0 + 0.7);
      gain.gain.setValueAtTime(0.55, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.8);
      osc.connect(gain).connect(ac.destination);
      osc.start(t0); osc.stop(t0 + 0.85);
      const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.4), ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const src = ac.createBufferSource();
      const ng = ac.createGain();
      ng.gain.setValueAtTime(0.35, t0);
      ng.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4);
      src.buffer = buf;
      src.connect(ng).connect(ac.destination);
      src.start(t0);
    } catch { /* 静默 */ }
  },
  // 冰冻：高频下行琶音，冰晶闪烁
  ice: () => playNotes([1568, 1319, 1047, 880, 740, 622], { type: 'triangle', dur: 0.22, gap: 0.08, vol: 0.3 }),
  // 龙卷风：呼啸风声（噪声 + 带通滤波扫频）
  tornado: () => {
    try {
      const ac = ensureCtx();
      const t0 = ac.currentTime;
      const dur = 2.8;
      const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource();
      src.buffer = buf;
      const bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 1.2;
      bp.frequency.setValueAtTime(220, t0);
      bp.frequency.linearRampToValueAtTime(750, t0 + dur * 0.45);
      bp.frequency.linearRampToValueAtTime(260, t0 + dur);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime(0.5, t0 + 0.3);
      g.gain.linearRampToValueAtTime(0.4, t0 + dur * 0.7);
      g.gain.linearRampToValueAtTime(0.001, t0 + dur);
      src.connect(bp).connect(g).connect(ac.destination);
      src.start(t0); src.stop(t0 + dur);
    } catch { /* 静默 */ }
  },
  // 火山喷发：爆炸 + 低频持续轰鸣
  volcano: () => {
    try {
      const ac = ensureCtx();
      const t0 = ac.currentTime;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, t0);
      osc.frequency.linearRampToValueAtTime(38, t0 + 2.2);
      g.gain.setValueAtTime(0.45, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 2.4);
      osc.connect(g).connect(ac.destination);
      osc.start(t0); osc.stop(t0 + 2.45);
    } catch { /* 静默 */ }
  },
  // 雷鸣：噪声炸裂 + 低频余响
  thunder: () => {
    try {
      const ac = ensureCtx();
      const t0 = ac.currentTime;
      const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.5), ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.6);
      const src = ac.createBufferSource();
      const g = ac.createGain();
      g.gain.setValueAtTime(0.5, t0);
      src.buffer = buf;
      src.connect(g).connect(ac.destination);
      src.start(t0);
      const osc = ac.createOscillator();
      const g2 = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, t0);
      osc.frequency.exponentialRampToValueAtTime(30, t0 + 1.2);
      g2.gain.setValueAtTime(0.4, t0);
      g2.gain.exponentialRampToValueAtTime(0.001, t0 + 1.3);
      osc.connect(g2).connect(ac.destination);
      osc.start(t0); osc.stop(t0 + 1.35);
    } catch { /* 静默 */ }
  },
  // 地震：超低频隆隆 + 玻璃碎裂叮当
  quake: () => {
    try {
      const ac = ensureCtx();
      const t0 = ac.currentTime;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(32, t0);
      osc.frequency.linearRampToValueAtTime(26, t0 + 2.4);
      g.gain.setValueAtTime(0.5, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 2.6);
      osc.connect(g).connect(ac.destination);
      osc.start(t0); osc.stop(t0 + 2.65);
      // 玻璃碎裂高频叮当（随机时机）
      [0.15, 0.4, 0.7, 1.0, 1.5, 2.0].forEach((delay) => {
        const osc2 = ac.createOscillator();
        const g2 = ac.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1200 + Math.random() * 1400, t0 + delay);
        g2.gain.setValueAtTime(0.18, t0 + delay);
        g2.gain.exponentialRampToValueAtTime(0.001, t0 + delay + 0.12);
        osc2.connect(g2).connect(ac.destination);
        osc2.start(t0 + delay); osc2.stop(t0 + delay + 0.14);
      });
    } catch { /* 静默 */ }
  },
};

/** 语音播报（童趣音调；lang 由称赞库随机决定：zh-CN / zh-HK / en-US） */
export function speak(text, { pitch = 1.4, rate = 1.05, lang = 'zh-CN' } = {}) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.pitch = pitch;
    u.rate = rate;
    window.speechSynthesis.speak(u);
  } catch { /* 静默 */ }
}

// 预热语音列表（部分浏览器异步加载）
if ('speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}
