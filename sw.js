const CACHE_NAME = 'freshmaximum-v1';

// Yükleme — boş cache oluştur
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

// Aktivasyon — eski cache'leri temizle
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.map(function(name) {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Her istekte önce ağdan al, başarısız olursa cache'den göster
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Başarılı yanıtı cache'e kaydet
        const clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(function() {
        // Ağ yoksa cache'den göster (offline destek)
        return caches.match(event.request);
      })
  );
});
