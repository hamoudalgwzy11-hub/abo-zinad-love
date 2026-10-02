// ==================== Service Worker ====================
// Abo Zinad Love - يعمل بدون إنترنت

// غيّرنا رقم الإصدار حتى يتم حذف الكاش القديم وتحميل الملفات الجديدة
const CACHE_NAME = 'abo-zinad-love-v1.0.1';

const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// التثبيت
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching files');
                return cache.addAll(URLS_TO_CACHE);
            })
            .catch((error) => {
                console.error('[SW] Cache installation error:', error);
            })
            .then(() => self.skipWaiting())
    );
});

// التنشيط وحذف الإصدارات القديمة
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                        return Promise.resolve();
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// جلب الملفات: الشبكة أولًا، ثم الكاش عند انقطاع الإنترنت
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();

                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }

                return networkResponse;
            })
            .catch(() => {
                return caches.match(event.request).then((cachedResponse) => {
                    return cachedResponse || caches.match('/index.html');
                });
            })
    );
});

// استقبال رسائل من التطبيق
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('[SW] Service Worker Loaded - v1.0.1');
