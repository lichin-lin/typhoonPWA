var dataCacheName = 'TyphoonData-x75';
var cacheName = 'TyphoonPWA';
var filesToCache = [
    '/',
    '/index.html',
    '/index.html?homescreen=1',
    '/?homescreen=1',
    '/styles/main.css',
    '/scripts/jquery.min.js',
    '/scripts/main.min.js',
    '/scripts/typhoon.js',
];

self.addEventListener('install', e => {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching App Shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate',  event => {
    console.log('[ServiceWorker] Activate');
    event.waitUntil(
      caches.keys().then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          console.log('[ServiceWorker] Removing old cache', key);
          if (key !== cacheName) {
            return caches.delete(key);
          }
        }));
      })
    );
});


self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  var dataUrl = 'https://quote-b781f.firebaseio.com/typhoon.json';
  if (e.request.url.indexOf(dataUrl) === 0) {
    e.respondWith(
      fetch(e.request)
        .then(function(response) {
          return caches.open(dataCacheName).then(function(cache) {
            cache.put(e.request.url, response.clone());
            console.log('[ServiceWorker] Fetched&Cached Data');
            return response;
          });
        })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
