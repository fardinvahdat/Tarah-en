const CACHE_NAME = "tarrah-pwa-v1.2.0";
const STATIC_CACHE = "tarrah-static-v1.2.0";
const DYNAMIC_CACHE = "tarrah-dynamic-v1.2.0";
const IMAGES_CACHE = "tarrah-images-v1.2.0";
const FONTS_CACHE = "tarrah-fonts-v1.2.0";

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/pwa-192x192.png",
  "/pwa-512x512.png",
  // Critical CSS and JS will be added by Vite
];

import { baseURL } from "@/src/configs/base";

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
      self.skipWaiting(),
    ])
  );
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== IMAGES_CACHE &&
              cacheName !== FONTS_CACHE
            ) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim(),
    ])
  );
});

// Fetch event - advanced caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension
  if (request.method !== "GET" || url.protocol === "chrome-extension:") {
    return;
  }

  // Handle different resource types with appropriate strategies
  if (url.pathname.includes(baseURL) || url.pathname.includes(baseURL)) {
    // API calls - Network First with fallback
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
  } else if (request.destination === "image") {
    // Images - Cache First with network fallback
    event.respondWith(cacheFirstStrategy(request, IMAGES_CACHE, 86400000)); // 24 hours
  } else if (
    url.pathname.includes(".woff") ||
    url.pathname.includes(".ttf") ||
    url.pathname.includes("fonts")
  ) {
    // Fonts - Cache First (fonts rarely change)
    event.respondWith(cacheFirstStrategy(request, FONTS_CACHE, 2592000000)); // 30 days
  } else if (request.destination === "document") {
    // HTML documents - Network First with cache fallback
    event.respondWith(networkFirstStrategy(request, STATIC_CACHE));
  } else {
    // Static assets (JS, CSS) - Stale While Revalidate
    event.respondWith(staleWhileRevalidateStrategy(request, STATIC_CACHE));
  }
});

// Network First Strategy
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log("Network failed, trying cache:", error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline fallback for API calls
    if (request.url.includes(baseURL)) {
      return new Response(
        JSON.stringify({
          error: "Offline",
          message: "اتصال اینترنت قطع است",
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 503,
        }
      );
    }
    throw error;
  }
}

// Cache First Strategy
async function cacheFirstStrategy(request, cacheName, maxAge = 86400000) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    const dateHeader = cachedResponse.headers.get("date");
    const cachedDate = dateHeader ? new Date(dateHeader).getTime() : 0;
    const now = Date.now();

    // If cache is still fresh, return it
    if (now - cachedDate < maxAge) {
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Background Sync for failed requests
self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag);

  if (event.tag === "background-sync-upload") {
    event.waitUntil(syncUploads());
  }
});

async function syncUploads() {
  try {
    // Get queued uploads from IndexedDB
    const uploads = await getQueuedUploads();

    for (const upload of uploads) {
      try {
        const formData = new FormData();
        formData.append("file", upload.file);
        formData.append("type", upload.type);

        const response = await fetch(upload.endpoint, {
          method: "POST",
          body: formData,
          headers: upload.headers,
        });

        if (response.ok) {
          await removeQueuedUpload(upload.id);
          // Notify the client
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: "UPLOAD_SUCCESS",
                uploadId: upload.id,
                result: response.json(),
              });
            });
          });
        }
      } catch (error) {
        console.error("Sync upload failed:", error);
      }
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

// Push notifications
self.addEventListener("push", (event) => {
  console.log("Push notification received:", event);

  const options = {
    body: event.data ? event.data.text() : "اعلان جدید از Tarah",
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: "1",
    },
    actions: [
      {
        action: "explore",
        title: "مشاهده",
        icon: "/pwa-192x192.png",
      },
      {
        action: "close",
        title: "بستن",
        icon: "/pwa-192x192.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("Tarah", options));
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received:", event);

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(self.clients.openWindow("/"));
  }
});

// Helper functions for IndexedDB operations
async function getQueuedUploads() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("TarrahPWA", 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["uploads"], "readonly");
      const store = transaction.objectStore("uploads");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
}

async function removeQueuedUpload(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("TarrahPWA", 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["uploads"], "readwrite");
      const store = transaction.objectStore("uploads");
      const deleteRequest = store.delete(id);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
}
