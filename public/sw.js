// ========================================
// Service Worker — PWA
// ========================================

const CACHE_NAME = 'village-water-v1'
const OFFLINE_URL = '/offline'

// ไฟล์ที่ cache ไว้ใช้ offline
const PRECACHE_URLS = [
  '/',
  '/overview',
  '/offline',
  '/logo.png',
  '/icon.png',
]

// ========================================
// Install
// ========================================
self.addEventListener('install', event => {
  console.log('[SW] Installing...')

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Pre-caching')
        return cache.addAll(PRECACHE_URLS)
      })
      .then(() => self.skipWaiting()),
  )
})

// ========================================
// Activate
// ========================================
self.addEventListener('activate', event => {
  console.log('[SW] Activating...')

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Removing old cache:', cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// ========================================
// Fetch — Network First, Cache Fallback
// ========================================
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // ข้าม non-GET
  if (request.method !== 'GET') return

  // ข้าม Supabase API
  if (url.hostname.includes('supabase')) return

  // ข้าม HMR / dev tools
  if (
    url.pathname.includes('/_next/webpack-hmr') ||
    url.pathname.includes('/_next/static/development')
  ) {
    return
  }

  // ข้าม Google Maps
  if (
    url.hostname.includes('google') ||
    url.hostname.includes('gstatic')
  ) {
    return
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache ไฟล์ที่โหลดสำเร็จ
        if (
          response.ok &&
          (url.pathname.startsWith('/_next/static/') ||
            url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/))
        ) {
          const cloned = response.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, cloned)
          })
        }
        return response
      })
      .catch(() => {
        // ถ้า offline → ใช้ cache
        return caches.match(request).then(cached => {
          if (cached) return cached

          // ถ้าเป็น HTML request → แสดงหน้า offline
          if (request.destination === 'document') {
            return caches.match(OFFLINE_URL)
          }
        })
      }),
  )
})

// ========================================
// Message — สำหรับ Badge API
// ========================================
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})