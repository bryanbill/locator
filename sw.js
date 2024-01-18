var cacheName = 'locator';

var filesToCache = [
    '/',
    './index.html',
    "./index.js",
    '/.style.css'
];

self.addEventListener('install', function (event) {
    console.log('Service Worker: Installed');

    event.waitUntil(
        caches.open(cacheName)
            .then(function (cache) {
                console.log('Service Worker: Caching Files');
                return cache.addAll(filesToCache);
            })
            .catch(function (err) {
                console.log(err, 'Service Worker: Error Caching Files -> Cache.addAll() requires a secure context');
            })
    );
}
);


self.addEventListener('activate', function (event) {
    console.log('Service Worker: Activated');

    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(cacheNames.map(function (thisCacheName) {
                if (thisCacheName !== cacheName) {
                    console.log('Service Worker: Removing Cached Files from Cache - ', thisCacheName);
                    return caches.delete(thisCacheName);
                }
            }));
        })
    );
});