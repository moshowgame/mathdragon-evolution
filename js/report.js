// 家长报告：学习统计 + 错题本渲染

import { getReport } from './storage.js';

const MODULE_NAMES = { add: '加法', sub: '减法', mult: '乘法', div: '除法', eq: '方程', py: '拼音' };
const LEVEL_NAMES = { py: { 10: '单韵母入门' } };

/** 渲染家长报告页，返回错题列表（供"重做错题"使用） */
export function renderReport() {
  const { totalStars, streakDays, dailyDone, stats, wrongs } = getReport();

  const summary = document.getElementById('report-summary');
  summary.innerHTML = `
    <div class="stat-chip">⭐ 累计星星 <strong>${totalStars}</strong></div>
    <div class="stat-chip">🔥 连续打卡 <strong>${streakDays}</strong> 天</div>
    <div class="stat-chip">${dailyDone ? '✅ 今日已完成' : '⏳ 今日还未完成'}</div>
  `;

  const statsEl = document.getElementById('report-stats');
  const keys = Object.keys(stats);
  if (keys.length === 0) {
    statsEl.innerHTML = '<p class="report-empty">还没有学习记录，快去答题吧！</p>';
  } else {
    statsEl.innerHTML = keys.map(key => {
      const s = stats[key];
      const [module, level] = key.split('_');
      const rate = s.attempts ? Math.round((s.correct / s.attempts) * 100) : 0;
      const color = rate >= 80 ? '#66bb6a' : rate >= 60 ? '#ffb74d' : '#ef5350';
      return `
        <div class="stat-row">
          <span class="stat-name">${MODULE_NAMES[module] || module} · ${(LEVEL_NAMES[module] && LEVEL_NAMES[module][level]) || level + ' 以内'}</span>
          <div class="stat-bar"><div class="stat-bar-fill" style="width:${rate}%;background:${color}"></div></div>
          <span class="stat-rate" style="color:${color}">${rate}%</span>
          <span class="stat-detail">（${s.correct}/${s.attempts} 题 · ${s.sessions} 轮）</span>
        </div>`;
    }).join('');
  }

  const listEl = document.getElementById('report-wrong-list');
  const recent = wrongs.slice(0, 20);
  if (recent.length === 0) {
    listEl.innerHTML = '<p class="report-empty">错题本是空的，太厉害啦！🎉</p>';
  } else {
    listEl.innerHTML = recent.map(w => `
      <div class="wrong-item">
        <span class="wrong-expr">${w.a} ${w.op} ${w.b} = ${w.answer}</span>
        <span class="wrong-mine">孩子答了 ${w.wrong}</span>
        <span class="wrong-date">${w.date}</span>
      </div>`).join('');
  }
  return recent;
}
