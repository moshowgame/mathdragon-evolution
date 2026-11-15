// 题目生成模块：加法/减法 × 10以内/20以内/100以内

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

/**
 * 生成一组题目
 * @param {'add'|'sub'} module 模块：加法 / 减法
 * @param {10|20|100} level 阶段
 * @param {number} count 题数
 */
export function generateQuestions(module, level, count) {
  const seen = new Set();
  const questions = [];
  let guard = 0;
  while (questions.length < count && guard < count * 200) {
    guard++;
    const q = module === 'add' ? genAdd(level) : genSub(level);
    const key = `${q.a}${module}${q.b}`;
    if (seen.has(key)) continue;
    seen.add(key);
    questions.push(q);
  }
  // 题数不足时（如 10 以内组合有限）允许重复补充
  while (questions.length < count) {
    const q = module === 'add' ? genAdd(level) : genSub(level);
    questions.push(q);
  }
  return questions.map(q => ({ ...q, options: makeOptions(q.answer) }));
}

// ---------- 加法 ----------
function genAdd(level) {
  if (level === 10) {
    // 和不超过 10
    const a = rand(1, 9);
    const b = rand(1, 10 - a);
    return { a, b, op: '+', answer: a + b };
  }
  if (level === 20) {
    // 偏重进位加（跨 10），如 8+5
    const crossing = Math.random() < 0.6;
    if (crossing) {
      const a = rand(2, 9);
      const b = rand(11 - a, Math.min(20 - a, 9));
      return { a, b, op: '+', answer: a + b, cross10: true };
    }
    const a = rand(2, 10);
    const b = rand(1, Math.min(20 - a, 9));
    return { a, b, op: '+', answer: a + b };
  }
  // 100 以内：两位数为主，偏重进位
  const crossing = Math.random() < 0.6;
  if (crossing) {
    // 个位相加超过 10
    const a = rand(11, 89);
    const onesA = a % 10;
    const b = onesA + rand(10 - onesA, Math.min(9, 100 - a - (10 - onesA)));
    if (b < 1 || a + b > 100) return genAdd(100);
    return { a, b, op: '+', answer: a + b, cross10: true };
  }
  const a = rand(11, 88);
  const b = rand(1, Math.min(99 - a, a > 50 ? 11 : 30));
  if (a + b > 100) return genAdd(100);
  return { a, b, op: '+', answer: a + b };
}

// ---------- 减法 ----------
function genSub(level) {
  if (level === 10) {
    const a = rand(2, 10);
    const b = rand(1, a - 1);
    return { a, b, op: '−', answer: a - b };
  }
  if (level === 20) {
    // 偏重退位减（跨 10），如 15-8
    const crossing = Math.random() < 0.6;
    if (crossing) {
      const a = rand(11, 19);
      const b = rand(a - 10 + 1, 9); // 保证个位不够减
      return { a, b, op: '−', answer: a - b, cross10: true };
    }
    const a = rand(11, 20);
    const b = rand(1, a % 10); // 个位够减，不退位
    return { a, b, op: '−', answer: a - b };
  }
  // 100 以内：两位数减，偏重退位
  const crossing = Math.random() < 0.6;
  if (crossing) {
    const a = rand(21, 98);
    const onesA = a % 10;
    if (onesA === 0) return genSub(100);
    const b = rand(onesA + 1, Math.min(9, a - 10)); // 个位不够减
    return { a, b, op: '−', answer: a - b, cross10: true };
  }
  const a = rand(21, 99);
  const b = rand(1, a % 10);
  return { a, b, op: '−', answer: a - b };
}

// ---------- 选项 ----------
function makeOptions(answer) {
  const opts = new Set([answer]);
  const spread = Math.max(1, Math.round(answer * 0.15));
  const candidates = [1, -1, 2, -2, 10, -10, spread, -spread, rand(1, spread + 2), rand(-spread - 2, -1)];
  shuffle(candidates).forEach(d => {
    const v = answer + d;
    if (opts.size < 4 && v >= 0 && v !== answer) opts.add(v);
  });
  let n = 0;
  while (opts.size < 4) { n++; const v = answer + n; if (!opts.has(v)) opts.add(v); }
  return shuffle([...opts]);
}
