// 小火龙数学进化论 - 离线缓存 Service Worker
const CACHE = 'mathdragon-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/icon.svg',
  './css/style.css',
  './js/main.js', './js/quiz.js', './js/questions.js', './js/explain.js',
  './js/dragon.js', './js/audio.js', './js/praise.js', './js/storage.js',
  './js/report.js', './js/learn.js', './js/pinyin.js',
  './assets/audio/pinyin/a1.mp3', './assets/audio/pinyin/o1.mp3', './assets/audio/pinyin/e1.mp3',
  './assets/audio/pinyin/i1.mp3', './assets/audio/pinyin/u1.mp3', './assets/audio/pinyin/v1.mp3',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// 缓存优先，未命中回源并更新缓存
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit
        || fetch(e.request).then((res) => {
          if (res.ok && e.request.method === 'GET') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => hit)
    )
  );
});
