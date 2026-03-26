// Service Worker for PWA functionality
const CACHE_NAME = 'pl-system-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/guaranteed-install.html',
  '/direct-install.html',
  '/complete-pwa-test.html',
  '/login'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests (like API calls)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      handleNavigationRequest(event.request)
    );
    return;
  }

  // Handle API and other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
          });
      })
  );
});

// Handle navigation requests with login state logic
async function handleNavigationRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // Check if user is logged in by checking localStorage
    const clients = await self.clients.matchAll();
    const client = clients[0];
    
    if (client) {
      // Get login state from the client
      const loginState = await client.postMessage({
        type: 'GET_LOGIN_STATE'
      });
      
      // For now, check if user has valid tokens in cookies/localStorage
      const hasToken = request.headers.get('Cookie')?.includes('token=') || 
                        request.url.includes('dashboard');
      
      if (hasToken && pathname === '/') {
        // User is logged in and trying to access root - redirect to dashboard
        console.log('User logged in, redirecting to dashboard');
        return Response.redirect('/dashboard');
      }
      
      if (!hasToken && pathname !== '/login' && pathname !== '/') {
        // User not logged in and not on login page - redirect to login
        console.log('User not logged in, redirecting to login');
        return Response.redirect('/login');
      }
    }
  } catch (error) {
    console.log('Error checking login state:', error);
  }

  // Serve from cache or network
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  return fetch(request);
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle login state messages
  if (event.data && event.data.type === 'LOGIN_STATE') {
    console.log('Login state updated:', event.data.isLoggedIn);
  }
});

console.log('Service Worker loaded successfully');
