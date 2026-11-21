// 多语言称赞语库：中文 / 粤语 / 英语 各 20 条（共 60 条），随机调用且不重复
// 采用"洗牌袋"（shuffle bag）机制：把 60 条整体洗牌后逐条抽出，抽完整袋才重新洗牌，
// 因此一轮之内（60 次调用）绝不重复，且三种语言随机穿插

/** 三语称赞库（各 20 条，语言内保证互不重复） */
const BANK = {
  zh: [
    '答对啦，你太棒啦！', '哇，好厉害呀！', '完全正确，继续加油！', '真聪明，小火龙为你骄傲！',
    '太厉害了，简直是数学小天才！', '这都能答对，你太牛啦！', '哇塞，又对啦！', '了不起，继续保持！',
    '哇，你的小脑瓜真好使！', '正确！你真是个小学霸！', '厉害厉害，火龙都看呆啦！', '答得又快又对，太优秀啦！',
    '好样的，一步都没错！', '哇，星星都要为你闪闪啦！', '太完美了，满分表现！', '你真是计算小达人！',
    '又答对啦，火焰都为你燃烧！', '太精彩了，继续冲鸭！', '超级棒，火龙给你点一百个赞！', '今天也是闪闪发光的数学明星！',
  ],
  yue: [
    '好叻呀！答对咗！', '犀利呀，全部啱晒！', '醒目宝宝，真係叻！', '好嘢！继续落力啦！',
    '叻到冇朋友啦！', '掂过碌蔗！', '正到飞起呀！', '好巴闭呀你！',
    '答得靓仔又靓女！', '一啲都唔使谂，快靓正！', '厉害啦喂，火龙都俾你吓亲！', '真係天才小神童！',
    '叻叻叻，火龙送你一粒星！', '好犀利，一击即中！', '醒目过小龙女！', '完全冇难度啫！',
    '再嚟多题都冇怕啦！', '超级叻仔，火龙为你拍手掌！', '厉害到火龙都喷烟啦！', '今天你係最叻嘅数学王！',
  ],
  en: [
    'Great job! You did it!', 'Awesome! So smart!', 'Brilliant answer!', 'Well done, math star!',
    'Fantastic! Keep it up!', 'You are on fire!', 'Nailed it!', 'Super clever, little dragon approves!',
    'Amazing work!', 'You rock!', 'Genius move!', 'Perfect answer!',
    'Way to go, champion!', 'Incredible! You make it look easy!', 'So smart, dragon loves it!', 'High five, math hero!',
    'Wow, lightning fast and correct!', 'Unstoppable!', 'Excellent! Dragon gives you a big thumbs up!', 'You are today\'s shining math star!',
  ],
};

/** 语音合成的 BCP-47 语言代码 */
const TTS_LANG = { zh: 'zh-CN', yue: 'zh-HK', en: 'en-US' };

/** 全局洗牌袋：[{ lang, tts, text }]，抽空后重新洗牌 */
let bag = [];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function refill() {
  bag = shuffle(
    Object.entries(BANK).flatMap(([lang, list]) =>
      list.map((text) => ({ lang, tts: TTS_LANG[lang], text }))
    )
  );
}

/**
 * 随机取一条称赞（三语随机穿插，一轮 60 次调用内绝不重复）
 * @returns {{ lang: 'zh'|'yue'|'en', tts: string, text: string }}
 */
export function nextPraise() {
  if (bag.length === 0) refill();
  return bag.pop();
}
