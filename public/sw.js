// When version is changed, a new service worker will be created
let version = 1;
// Names of cache
let staticName = `staticCache-${version}`;

// What we would store into the cache
let assets = [
  // Best to put root in both ways
  "/",
  "/index.html",
  "/css/styles.css",
  "/js/app.js",
  "/js/index.js",
  "/js/idb.js",
];

self.addEventListener("install", (e) => {
  // Service worker is installed
  console.log(`SW Version ${version} installed`);
  // Build a cache and make browser wait until all assets have been cached
  e.waitUntil(
    // Create cache
    caches.open(staticName).then((cache) => {
      cache.addAll(assets).then(
        () => {
          console.log(`${staticName} has been updated`);
        },
        (err) => {
          console.warn(`Failed to update ${staticName}`);
        }
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // Service worker is activated
  console.log("activated");

  // Will delete all caches that don't match static name
  e.waitUntil(
    caches.keys().then((keys) => {
      // waitUntil() wants a promise returned
      return Promise.all(
        // Returns a new array which won't contain the current staticName then we call delete on all of them
        keys
          .filter((key) => key !== staticName)
          .map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(function (request) {
      if (request) {
        // if cache is available, respond with cache
        console.log("responding with cache : " + e.request.url);
        return request;
      } else {
        // if there are no cache, try fetching request
        console.log("file is not cached, fetching : " + e.request.url);
        return fetch(e.request);
      }
    })
  );
});

self.addEventListener("message", (e) => {
  // Message from webpage
});
