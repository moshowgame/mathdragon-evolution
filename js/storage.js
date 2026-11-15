// 本地存储：错题本 / 学习统计 / 星星 / 连续打卡（全部 localStorage，无后端）

const KEY = 'mathdragon_v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
const todayStr = () => new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD
const yesterdayStr = () => {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('sv-SE');
};

/**
 * 记录一次答题结果
 * @param {{module:string, level:number, correct:number, total:number, stars:number, wrongs:{a:number,b:number,op:string,answer:number,wrong:number}[]}} result
 * @returns {{bonus:boolean, streak:number}} bonus: 今日首次完成（星星翻倍）
 */
export function recordQuizResult(result) {
  const data = load();
  const today = todayStr();

  // 学习统计：按 模块+难度 累计
  data.stats = data.stats || {};
  const key = `${result.module}_${result.level}`;
  const s = data.stats[key] = data.stats[key] || { attempts: 0, correct: 0, sessions: 0 };
  s.attempts += result.total;
  s.correct += result.correct;
  s.sessions += 1;

  // 错题本（最多保留 50 条，新的在前）
  data.wrongs = data.wrongs || [];
  (result.wrongs || []).forEach(w => data.wrongs.unshift({ ...w, date: today }));
  data.wrongs = data.wrongs.slice(0, 50);

  // 星星 + 连续打卡（今日首次完成星星翻倍）
  const bonus = data.lastDone !== today;
  data.totalStars = (data.totalStars || 0) + result.stars * (bonus ? 2 : 1);
  if (data.lastDone === today) {
    // 已打卡，天数不变
  } else if (data.lastDone === yesterdayStr()) {
    data.streakDays = (data.streakDays || 0) + 1;
  } else {
    data.streakDays = 1;
  }
  data.lastDone = today;

  save(data);
  return { bonus, streakDays: data.streakDays };
}

/** 首页顶部数据：星星 / 连续天数 / 今日是否已打卡 */
export function getHomeStats() {
  const data = load();
  return {
    totalStars: data.totalStars || 0,
    streakDays: data.streakDays || 0,
    dailyDone: data.lastDone === todayStr(),
  };
}

/** 家长报告数据 */
export function getReport() {
  const data = load();
  return {
    totalStars: data.totalStars || 0,
    streakDays: data.streakDays || 0,
    dailyDone: data.lastDone === todayStr(),
    stats: data.stats || {},
    wrongs: data.wrongs || [],
  };
}

/** 清除已重做掌握的错题 */
export function removeWrongs(keys) {
  const data = load();
  const set = new Set(keys);
  data.wrongs = (data.wrongs || []).filter(w => !set.has(`${w.a}${w.op}${w.b}`));
  save(data);
}
