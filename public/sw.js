const CACHE_NAME = "app-cache-v1";
const DYNAMIC_CACHE = "dynamic-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/src/main.tsx", // Adjust if using TypeScript
  "/src/App/App.tsx",
  "/src/App/App.css",
  "/src/DashBoard/DashBoard.tsx",
  "/src/DashBoard/DashBoard.css",
  "/src/Header/Header.tsx",
  "/src/Header/Header.css",
  "/src/philosophyNotes/philosophyNotes.tsx",
  "/src/philosophyNotes/philosophyNotes.css",
  "/src/Statistics/Statistics.tsx",
  "/src/Statistics/Statistics.css",
  "/src/Task/Task.tsx",
  "/src/Task/Task.css",
  "/Logo.jpg",
  "/Study.png",
  "/Work.png", 
  "/Health.png", 
  "/Meditation.png",
  "/fallback.html",
  "/Alarm.mp3" // Add other assets
];

// Install event - Cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Pre-caching static assets...");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
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
  self.clients.claim();
});

// Fetch event - Serve from cache, then fetch and cache dynamically
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse && event.request.url !== "http://localhost:3000/load") {
        //console.log("Serving from cache:", event.request.url);
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            if (!response || response.status !== 200 || response.type !== "basic") {
              return response; // ✅ Only cache successful "basic" responses
            }
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match("/fallback.html")); // Optional: Add a fallback
    })
  );
});
