const CACHE_NAME = "auratten-cache-v1";
const OFFLINE_URL = "/offline.html";

const ASSETS_TO_CACHE = [
    "/",
    "/login",
    "/globals.css",
    "/favicon.ico",
    OFFLINE_URL
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(OFFLINE_URL);
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Background Sync functionality
self.addEventListener("sync", (event) => {
    if (event.tag === "sync-attendance") {
        event.waitUntil(syncAttendance());
    }
});

async function syncAttendance() {
    // Logic to read from IndexedDB and send to server
    console.log("Background sync: Syncing attendance records...");
}
