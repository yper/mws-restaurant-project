console.log('start sw');

// When a new version of the cache is needed, we'll update the version in the name over here
const cacheName = 'restaurant-review-v7';
const filesToCache = [
    '/',
    '/index.html',
    '/restaurant.html',
    '/js/main.js',
    '/js/common.js',
    '/js/dbhelper.js',
    '/js/restaurant_info.js',
    '/css/styles.css',
    '/css/styles600.css',
    '/css/styles700.css',
    '/css/styles1150.css',
    '/fonts/pt-sans-v9-latin-regular.eot',
    '/fonts/pt-sans-v9-latin-regular.svg',
    '/fonts/pt-sans-v9-latin-regular.ttf',
    '/fonts/pt-sans-v9-latin-regular.woff',
    '/fonts/pt-sans-v9-latin-regular.woff2',
    '/img/1-247px.webp',
    '/img/1-451px.webp',
    '/img/1-670px.webp',
    '/img/2-247px.webp',
    '/img/2-451px.webp',
    '/img/2-670px.webp',
    '/img/3-247px.webp',
    '/img/3-451px.webp',
    '/img/3-670px.webp',
    '/img/4-247px.webp',
    '/img/4-451px.webp',
    '/img/4-670px.webp',
    '/img/5-247px.webp',
    '/img/5-451px.webp',
    '/img/5-670px.webp',
    '/img/6-247px.webp',
    '/img/6-451px.webp',
    '/img/6-670px.webp',
    '/img/7-247px.webp',
    '/img/7-451px.webp',
    '/img/7-670px.webp',
    '/img/8-247px.webp',
    '/img/8-451px.webp',
    '/img/8-670px.webp',
    '/img/9-247px.webp',
    '/img/9-451px.webp',
    '/img/9-670px.webp',
    '/img/10-247px.webp',
    '/img/10-451px.webp',
    '/img/10-670px.webp',
    '/img/no-picture-247px.webp',
    '/img/no-picture-451px.webp',
    '/img/no-picture-670px.webp',
    '/node_modules/idb/lib/idb.js'
  ];

// when installing this service worker, we'll cache all resources
self.addEventListener('install', function(event) {
    console.log('installing service worker, caching files...')
    event.waitUntil(
        caches.open(cacheName)
        .then(cache => {
            return cache.addAll(filesToCache)
            .then(() => self.skipWaiting());
        })
    );
});

self.addEventListener('fetch', function(event) {
    //console.log('test');
});


// Prior to fetching website content, we'll check whether there's an entry
// in our cache. If so, we load that one instead.
self.addEventListener('fetch', function(event) {
    // console.log('[SW] Fetch event for ', event.request.url);
    event.respondWith(
      caches.match(event.request).then(function(response) {
        if (response) {
          // console.log('[SW] Found ', event.request.url, ' in our cache...');
          return response;
        }
        // console.log('[SW] New network request for ', event.request.url);
        return fetch(event.request)
      })
    );
});