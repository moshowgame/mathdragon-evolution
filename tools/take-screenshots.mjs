// 截图生成脚本（README 用图）：puppeteer-core 驱动本机 Edge 无头浏览器
// 用法：node tools/take-screenshots.mjs（需先 node tools/gen-pinyin-audio.mjs 生成音频，可选）
import puppeteer from 'puppeteer-core';
import { createServer } from 'http';
import { mkdirSync, existsSync, readdirSync, unlinkSync } from 'fs';
import { readFile } from 'fs/promises';
import { extname, join, normalize } from 'path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'docs/screenshots');
const PORT = 8123;
const W = 1280, H = 800, SCALE = 2;

// ---------- 内置静态服务器 ----------
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.webmanifest': 'application/manifest+json' };
const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path === '/') path = '/index.html';
    const file = normalize(join(ROOT, path));
    if (!file.startsWith(ROOT)) throw new Error('forbidden');
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(PORT, r));

// ---------- 查找 Edge / Chrome ----------
const CANDIDATES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const exe = CANDIDATES.find(p => existsSync(p));
if (!exe) { console.error('未找到 Edge/Chrome'); process.exit(1); }

// ---------- 预置学习数据（让统计/报告更好看） ----------
const today = new Date();
const yest = new Date(); yest.setDate(today.getDate() - 1);
const fmt = d => d.toLocaleDateString('sv-SE');
const seed = {
  totalStars: 4,
  streakDays: 3,
  lastDone: fmt(today),
  stats: {
    add_10: { attempts: 120, correct: 108, sessions: 6 },
    add_20: { attempts: 80, correct: 62, sessions: 4 },
    sub_10: { attempts: 90, correct: 84, sessions: 4 },
    sub_20: { attempts: 70, correct: 49, sessions: 3 },
    mult_10: { attempts: 60, correct: 51, sessions: 3 },
    eq_10: { attempts: 40, correct: 32, sessions: 2 },
    py_10: { attempts: 50, correct: 44, sessions: 3 },
    py_11: { attempts: 30, correct: 21, sessions: 2 },
  },
  wrongs: [
    { a: 15, b: 8, op: '−', answer: 7, wrong: 8, date: fmt(today) },
    { a: 8, b: 7, op: '−', answer: 1, wrong: 2, date: fmt(today) },
    { a: 14, b: 6, op: '−', answer: 8, wrong: 7, date: fmt(yest) },
    { a: 8, b: 4, op: '−', answer: 4, wrong: 3, date: fmt(yest) },
  ],
};

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: exe,
  headless: 'new',
  args: ['--no-first-run', '--disable-extensions'],
  defaultViewport: { width: W, height: H, deviceScaleFactor: SCALE },
});

const page = await browser.newPage();
await page.evaluateOnNewDocument((data) => {
  localStorage.setItem('mathdragon_v1', JSON.stringify(data));
  // 预装语音/音频自动播放不受 headless 限制
}, seed);

const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`) });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const visible = (sel) => page.$eval(sel, el => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)).catch(() => false);
const click = async (sel) => {
  await page.waitForSelector(sel, { visible: true, timeout: 5000 });
  await page.click(sel);
};
const text = (sel) => page.$eval(sel, el => el.textContent.trim()).catch(() => '');

await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });
await sleep(1200);
await shot('01-home');
console.log('✓ 01-home');

// 02 加法答题
await click('.module-card[data-module="add"]');
await click('.level-card[data-level="10"]');
await click('#btn-start');
await sleep(900);
await shot('02-quiz-add');
console.log('✓ 02-quiz-add');

// 03 答错解析
for (let i = 0; i < 12; i++) {
  if (await visible('#btn-show-explain')) break;
  const chips = await page.$$('#options .option');
  await chips[0].click();
  await sleep(1000);
}
await click('#btn-show-explain');
await sleep(2400);
await shot('03-quiz-explain');
console.log('✓ 03-quiz-explain');

// 04 结算页
if (await visible('#btn-continue')) await click('#btn-continue');
await sleep(600);
for (let i = 0; i < 40; i++) {
  if (await visible('#screen-result')) break;
  if (await visible('#btn-continue')) { await click('#btn-continue'); await sleep(500); continue; }
  if (await visible('#btn-skip')) { await click('#btn-skip'); await sleep(500); continue; }
  if (await visible('#btn-show-explain')) { await click('#btn-skip'); await sleep(500); continue; }
  const chips = await page.$$('#options .option');
  if (!chips.length) { await sleep(600); continue; }
  await chips[0].click();
  await sleep(1400);
}
await sleep(1500);
await shot('04-result');
console.log('✓ 04-result');

// 05 口算王
await click('#btn-home');
await sleep(400);
await click('#btn-challenge');
await click('.level-card[data-level="10"]');
await click('#btn-start');
await sleep(900);
await shot('05-challenge');
console.log('✓ 05-challenge');

// 06 方程王国
await click('#btn-quit');
await sleep(400);
await click('.module-card[data-module="eq"]');
await click('.level-card[data-level="10"]');
await click('#btn-start');
await sleep(900);
await shot('06-equation');
console.log('✓ 06-equation');

// 07 学习乐园
await click('#btn-quit');
await sleep(400);
await click('#btn-learn');
await sleep(3000);
await shot('07-learn');
console.log('✓ 07-learn');

// 08 拼音王国玩法选择
await click('#btn-back-learn');
await sleep(400);
await click('.module-card[data-module="py"]');
await sleep(600);
await shot('08-pinyin-home');
console.log('✓ 08-pinyin-home');

// 09 拼读拼字
await click('#py-btn-word');
await sleep(1000);
await shot('09-pinyin-game');
console.log('✓ 09-pinyin-game');

// 10 家长报告
await click('#btn-back-py'); // 游戏中 → 回玩法选择
await sleep(300);
await click('#btn-back-py'); // 玩法选择 → 回首页
await sleep(400);
await click('#btn-report');
await sleep(800);
await shot('10-report');
console.log('✓ 10-report');

await browser.close();
server.close();

// 清理旧的 jpg 截图
for (const f of await readdirSync(OUT)) {
  if (f.endsWith('.jpg')) unlinkSync(join(OUT, f));
}
console.log('all screenshots saved to docs/screenshots (*.png)');
