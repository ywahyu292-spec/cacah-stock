// Service worker: aplikasi tetap bisa dibuka & dipakai saat offline di gudang
const CACHE = 'cacah-stock-v2';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request, u = req.url;
  if (req.method !== 'GET' || u.includes('script.google')) return;   // data selalu live
  const put = res => { if (res && (res.ok || res.type === 'opaque')) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; };
  // Halaman aplikasi: ambil versi terbaru saat online, pakai cache saat offline
  if (req.mode === 'navigate' || u.endsWith('/') || u.endsWith('.html')) {
    e.respondWith(fetch(req).then(put).catch(() => caches.match(req).then(h => h || caches.match('./index.html'))));
    return;
  }
  // Library & ikon: cache dulu (cepat), diperbarui di belakang
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(put)));
});
