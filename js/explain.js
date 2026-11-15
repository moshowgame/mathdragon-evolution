// 错题解析模块：凑十法 / 进十法 / 破十法（拆十法） / 拆数法

/**
 * 根据题目生成逐步解析
 * @param {{a:number,b:number,op:'+'|'−',answer:number,cross10?:boolean}} q
 * @returns {{title:string, steps:{icon:string,text:string,math:string,final?:boolean}[]}}
 */
export function buildExplanation(q) {
  return q.op === '+' ? explainAdd(q) : explainSub(q);
}

// ---------- 加法 ----------
function explainAdd({ a, b, answer }) {
  const steps = [];
  const big = Math.max(a, b), small = Math.min(a, b);

  // 十以内：数数法
  if (answer <= 10) {
    steps.push({ icon: '🙋', text: `先记住大数 ${big}，再往上数 ${small} 个：`, math: '' });
    const countUp = Array.from({ length: small }, (_, i) => big + i + 1).join('、');
    steps.push({ icon: '👉', text: `接着数：${countUp}`, math: '' });
    steps.push({ icon: '🎉', text: `所以 ${a} + ${b} 就是`, math: `${a} + ${b} = ${answer}`, final: true });
    return { title: `加法解析：${a} + ${b}`, steps };
  }

  // 20 以内：进位用凑十法，不进位用拆数法
  if (answer <= 20) {
    if (big >= 10) {
      // 不进位：拆两位数
      const [bt, bo] = splitTensOnes(big);
      steps.push({ icon: '✂️', text: `把 ${big} 拆成 ${bt} 和 ${bo}`, math: `${big} = ${bt} + ${bo}` });
      steps.push({ icon: '1️⃣', text: `个位先加`, math: `${bo} + ${small} = ${bo + small}` });
      steps.push({ icon: '🎉', text: `整十数再加回来`, math: `${bt} + ${bo + small} = ${answer}`, final: true });
      return { title: `拆数法：${a} + ${b}`, steps };
    }
    const toTen = 10 - big;
    const rest = small - toTen;
    steps.push({ icon: '👀', text: `看大数 ${big}，它还差 ${toTen} 就能凑成 10！`, math: '' });
    steps.push({ icon: '✂️', text: `把小数 ${small} 拆成 ${toTen} 和 ${rest}`, math: `${small} = ${toTen} + ${rest}` });
    steps.push({ icon: '🧲', text: `先凑十：${big} 加 ${toTen}`, math: `${big} + ${toTen} = 10` });
    steps.push({ icon: '🎉', text: `再加剩下的 ${rest}`, math: `10 + ${rest} = ${answer}`, final: true });
    return { title: `凑十法：${a} + ${b}`, steps };
  }

  // 100 以内进位：进十法（先凑成整十）
  const onesA = a % 10;
  const usesA = onesA !== 0 && 10 - onesA <= b;
  if (usesA) {
    const toTen = 10 - onesA;
    const rest = b - toTen;
    const rounded = a + toTen;
    steps.push({ icon: '👀', text: `${a} 的个位是 ${onesA}，还差 ${toTen} 就变成整十数！`, math: '' });
    steps.push({ icon: '✂️', text: `从 ${b} 里拆出 ${toTen}${rest > 0 ? ` 和 ${rest}` : ''}`, math: rest > 0 ? `${b} = ${toTen} + ${rest}` : `${b} = ${toTen}` });
    steps.push({ icon: '🧲', text: `先凑整十`, math: `${a} + ${toTen} = ${rounded}` });
    steps.push({ icon: '🎉', text: `再加剩下的${rest > 0 ? ` ${rest}` : ''}`, math: `${rounded} + ${rest} = ${answer}`, final: true });
    return { title: `进十法：${a} + ${b}`, steps };
  }

  // 100 以内不进位：拆数法（十位加十位，个位加个位）
  const [at, ao] = splitTensOnes(a);
  const [bt, bo] = splitTensOnes(b);
  steps.push({ icon: '✂️', text: `把两个数都拆开：整十数和个位数`, math: `${a} = ${at} + ${ao}，${b} = ${bt} + ${bo}` });
  steps.push({ icon: '🔟', text: `整十数相加`, math: `${at} + ${bt} = ${at + bt}` });
  steps.push({ icon: '1️⃣', text: `个位数相加`, math: `${ao} + ${bo} = ${ao + bo}` });
  steps.push({ icon: '🎉', text: `合在一起`, math: `${at + bt} + ${ao + bo} = ${answer}`, final: true });
  return { title: `拆数法：${a} + ${b}`, steps };
}

// ---------- 减法 ----------
function explainSub({ a, b, answer }) {
  const steps = [];

  // 十以内：倒数法
  if (a <= 10) {
    const countDown = Array.from({ length: b }, (_, i) => a - i - 1).join('、');
    steps.push({ icon: '🙋', text: `从 ${a} 开始，往回数 ${b} 个：`, math: '' });
    steps.push({ icon: '👈', text: `倒数：${countDown}`, math: '' });
    steps.push({ icon: '🎉', text: `数到的最后一个就是答案`, math: `${a} − ${b} = ${answer}`, final: true });
    return { title: `减法解析：${a} − ${b}`, steps };
  }

  const onesA = a % 10;

  // 退位减（个位不够减）：20 以内用破十法，100 以内用拆十法
  if (onesA < b) {
    const tens = a - onesA; // 整十部分
    const onesPart = onesA + 10; // 借一位变成十几
    steps.push({ icon: '✂️', text: `把 ${a} 拆成 ${tens} 和 ${onesPart}`, math: `${a} = ${tens} + ${onesPart}` });
    steps.push({ icon: '💥', text: `先用十几去减（破十 / 拆十）`, math: `${onesPart} − ${b} = ${onesPart - b}` });
    steps.push({ icon: '➕', text: `再把整十数加回来`, math: `${tens} + ${onesPart - b} = ${answer}`, final: true });
    return { title: `${a <= 20 ? '破十法' : '拆十法'}：${a} − ${b}`, steps };
  }

  // 20 以内不退位：平十法（连续减）
  if (a <= 20) {
    steps.push({ icon: '✂️', text: `把 ${b} 拆成 ${onesA} 和 ${b - onesA}`, math: `${b} = ${onesA} + ${b - onesA}` });
    steps.push({ icon: '🔟', text: `先减到整十`, math: `${a} − ${onesA} = 10` });
    steps.push({ icon: '🎉', text: `再减剩下的`, math: `10 − ${b - onesA} = ${answer}`, final: true });
    return { title: `平十法：${a} − ${b}`, steps };
  }

  // 100 以内不退位：拆数法（个位减个位，十位不变）
  const [at, ao] = splitTensOnes(a);
  steps.push({ icon: '✂️', text: `把 ${a} 拆成 ${at} 和 ${ao}`, math: `${a} = ${at} + ${ao}` });
  steps.push({ icon: '1️⃣', text: `个位先减`, math: `${ao} − ${b} = ${ao - b}` });
  steps.push({ icon: '🎉', text: `十位不变，合起来`, math: `${at} + ${ao - b} = ${answer}`, final: true });
  return { title: `拆数法：${a} − ${b}`, steps };
}

function splitTensOnes(n) {
  const o = n % 10;
  return [n - o, o];
}
