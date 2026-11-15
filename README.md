# 🐉 小火龙数学进化论 · MathDragon Evolution

> **Answer · Learn · Evolve** —— 每天答 10 题，见证小火龙进化，也见证孩子进化！

## 🎮 立即开玩（已上线！）

**🔗 [https://moshowgame.github.io/mathdragon-evolution/](https://moshowgame.github.io/mathdragon-evolution/)**

> 无需安装、无需注册，手机/平板/电脑打开即玩。建议收藏给孩子每天练 10 题！

一个面向 **幼儿园到小学** 少儿的静态趣味心算学习网站。纯原生 HTML/CSS/JavaScript（ES Modules）构建，**零依赖、零构建、单仓库直推 GitHub Pages 即可上线**。

**作者：[Moshow郑锴](https://github.com/moshowgame)** · [CSDN 博客](https://zhengkai.blog.csdn.net/)

---

## ✨ 玩法特色

- **答题即进化**：每次正确率 ≥ 80%，右下角的小火龙就会进化成翼火龙，随机触发全屏 🔥火焰 / ❄️冰晶 特效（带全屏闪光和震动），语音播报「恭喜你又变强了！」——成长看得见
- **会闹脾气的小火龙**：平时点击火龙可以看它喷火（每次进页面限 3 次）；答题时一直点它会不耐烦，小小喷你一下火劝你学习，连点 5 次它真的会离家出走 20 秒再飞回来！
- **拖拽作答**：把正确答案拖到 `=` 后面的盒子里（Pointer Events 实现，手机/平板/鼠标全兼容），也支持直接点击
- **答错不批评，先问你要不要听**：火龙摇头说「这道题你应该会的啊」，点击「看看解析」才展开分步讲解，按题型智能选择教法
  - 凑十法（8 + 5 → 8+2=10 → 10+3=13）
  - 进十法（35 + 7 → 35+5=40 → 40+2=42）
  - 破十法 / 拆十法（15 − 8 → 10−8=2 → 5+2=7）
  - 平十法（12 − 3 → 12−2=10 → 10−1=9）
  - 拆数法（十位加十位、个位加个位）
- **音效 + 语音表扬**：WebAudio 合成的答对/答错音效 + 浏览器语音合成随机夸奖「答对啦，你太棒啦！」
- **8-bit 芯片音乐 BGM**：致敬魂斗罗时代的方波旋律（主旋律 + 贝斯 + 鼓组全程序化合成），右上角 🔊 可随时开关
- **童趣风格**：云朵飘动、圆角大按钮、星星结算、进度条，专为小朋友设计

## 📚 学习模块

| 模块 | 阶段 | 特点 |
|------|------|------|
| ➕ 加法城堡 | 10 / 20 / 100 以内 | 进位加自动加权 |
| ➖ 减法森林 | 10 / 20 / 100 以内 | 退位减自动加权 |

每轮开始前可选择题数：**10（默认）/ 20 / 30 / 50 / 100** 题。

## 🚀 快速开始

本项目无需安装任何依赖，任选一种方式运行：

```bash
# 方式一：直接用浏览器打开 index.html

# 方式二：本地静态服务器（推荐，ES Modules 需要 http 协议）
python -m http.server 8000
# 或
npx serve .
```

然后访问 http://localhost:8000

## 🌐 部署到 GitHub Pages

1. 将仓库推送到 GitHub（如 `moshowgame/mathdragon-evolution`）
2. 仓库 **Settings → Pages → Build and deployment**
3. Source 选择 `Deploy from a branch`，分支选 `main`，目录选 `/ (root)`，保存即可

线上地址形如：`https://moshowgame.github.io/mathdragon-evolution/`

## 🧱 技术栈

- 原生 **HTML5 + CSS3**（Grid / Flex / 动画，响应式适配手机与平板）
- 原生 **JavaScript ES Modules**，按职责拆分模块：
  - `js/questions.js` 题目生成（模块 × 阶段 × 题数）
  - `js/quiz.js` 答题流程与拖拽交互
  - `js/explain.js` 错题解析引擎（凑十 / 进十 / 破十 / 平十 / 拆数）
  - `js/dragon.js` 小火龙 SVG 吉祥物、进化演出与全屏冰火粒子特效
  - `js/audio.js` WebAudio 音效与语音合成
  - `js/music.js` 8-bit 芯片音乐循环（方波 + 三角波 + 噪声鼓组，程序化合成）
- 零框架、零构建工具，天然适合 GitHub Pages 托管

## 🗺️ Roadmap

- [ ] 乘法 / 除法模块
- [ ] 更多进化阶段（翼火龙 → 龙王）
- [ ] 每日打卡与星星收集册
- [ ] 家长报告（各阶段正确率统计）

## 📄 License

MIT
