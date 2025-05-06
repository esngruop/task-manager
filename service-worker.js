// نام کش برای تشخیص نسخه‌های مختلف
const CACHE_NAME = 'task-manager-cache-v1';

// لیست فایل‌هایی که می‌خواهیم ذخیره کنیم
const urlsToCache = [
  'index.html',
  'manifest.json',
  'icons/icon-72x72.png',
  'icons/icon-96x96.png',
  'icons/icon-128x128.png',
  'icons/icon-144x144.png',
  'icons/icon-152x152.png',
  'icons/icon-192x192.png',
  'icons/icon-384x384.png',
  'icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-regular-400.woff2'
];

// نصب سرویس ورکر و ذخیره فایل‌ها در کش
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('کش ایجاد شد');
        return cache.addAll(urlsToCache);
      })
  );
});

// وقتی درخواستی از طرف برنامه ارسال می‌شود
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // اگر فایل در کش وجود داشت، آن را باز می‌گردانیم
        if (response) {
          return response;
        }
        
        // در غیر این صورت، درخواست را به سرور ارسال می‌کنیم
        return fetch(event.request)
          .then(response => {
            // اگر درخواست موفق نبود یا به URL خارجی بود، پاسخ را بدون تغییر برمی‌گردانیم
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // در غیر این صورت، نسخه‌ای از پاسخ را در کش ذخیره می‌کنیم
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
      .catch(() => {
        // در صورت بروز خطا، می‌توانیم یک صفحه آفلاین نمایش دهیم
        if (event.request.url.indexOf('.html') > -1) {
          return caches.match('index.html');
        }
      })
  );
});

// حذف کش‌های قدیمی
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
