var dataCacheName = 'TyphoonData-x75';
var cacheName = 'TyphoonPWA';
var filesToCache = [
    '/',
    '/index.html',
    '/index.html?homescreen=1',
    '/?homescreen=1',
    '/styles/main.css',
    '/scripts/jquery.min.js',
    '/scripts/typhoon.js',
    '/scripts/monitor.js',
    './images/small.png',
    './images/middle.png',
    './images/danger.png',
];

// during the install phase you usually want to cache static assets
self.addEventListener('install', e => {
  console.log('[Service Worker] Install');
  // once the SW is installed, go ahead and fetch the resources to make this work offline
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[Service Worker] Caching App Shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate',  event => {
    console.log('[Service Worker] Activate');
    event.waitUntil(
      caches.keys().then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          console.log('[Service Worker] Removing old cache', key);
          if (key !== cacheName) {
            return caches.delete(key);
          }
        }));
      })
    );
});


// when the browser fetches a url
self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = 'https://quote-b781f.firebaseio.com/typhoon.json';
  
  // either respond with the cached object or go ahead and fetch the actual url
  if (e.request.url.indexOf(dataUrl) === 0) {
    e.respondWith(
      fetch(e.request)
        .then(function(response) {
          return caches.open(dataCacheName).then(function(cache) {
            cache.put(e.request.url, response.clone());
            console.log('[Service Worker] Fetched&Cached Data');
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
