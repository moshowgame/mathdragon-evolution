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
};

/** 中文语音播报（童趣音调） */
export function speak(text, { pitch = 1.4, rate = 1.05 } = {}) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.pitch = pitch;
    u.rate = rate;
    const zhVoice = window.speechSynthesis.getVoices().find(v => /zh|Chinese|中文/i.test(v.lang + v.name));
    if (zhVoice) u.voice = zhVoice;
    window.speechSynthesis.speak(u);
  } catch { /* 静默 */ }
}

// 预热语音列表（部分浏览器异步加载）
if ('speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

export const PRAISE = ['答对啦，你太棒啦！', '哇，好厉害呀！', '完全正确，继续加油！', '真聪明，小火龙为你骄傲！'];
