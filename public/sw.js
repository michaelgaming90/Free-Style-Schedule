const CACHE_NAME = "app-cache-v1";
const DYNAMIC_CACHE = "dynamic-cache-v1";
const STATIC_ASSETS = [
  "/Free-Style-Schedule/",
  "/Free-Style-Schedule/index.html",
  "/Free-Style-Schedule/src/main.tsx", // Adjust if using TypeScript
  "/Free-Style-Schedule/src/App/App.tsx",
  "/Free-Style-Schedule/src/App/App.css",
  "/Free-Style-Schedule/src/DashBoard/DashBoard.tsx",
  "/Free-Style-Schedule/src/DashBoard/DashBoard.css",
  "/Free-Style-Schedule/src/Header/Header.tsx",
  "/Free-Style-Schedule/src/Header/Header.css",
  "/Free-Style-Schedule/src/philosophyNotes/philosophyNotes.tsx",
  "/Free-Style-Schedule/src/philosophyNotes/philosophyNotes.css",
  "/Free-Style-Schedule/src/Statistics/Statistics.tsx",
  "/Free-Style-Schedule/src/Statistics/Statistics.css",
  "/Free-Style-Schedule/src/Task/Task.tsx",
  "/Free-Style-Schedule/src/Task/Task.css",
  "/Free-Style-Schedule/Logo.jpg",
  "/Free-Style-Schedule/Study.png",
  "/Free-Style-Schedule/Work.png", 
  "/Free-Style-Schedule/Health.png", 
  "/Free-Style-Schedule/Meditation.png",
  "/Free-Style-Schedule/fallback.html",
  "/Free-Style-Schedule/Alarm.mp3" // Add other assets
];

// Install event - Cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Pre-caching static assets...");
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - Cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Fetch event - Serve from cache, then fetch and cache dynamically
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        //console.log("Serving from cache:", event.request.url);
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match("/fallback.html")); // Optional: Add a fallback
    })
  );
});
