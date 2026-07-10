// ============================================================
// TechRadar Service Worker - PWA 离线缓存骨架
// 缓存策略：Cache-First（优先缓存，回退网络，最后离线兜底）
// ============================================================

// 缓存名称，包含版本号便于后续升级清理
var CACHE_NAME = "techradar-v1";

// 需要在 install 阶段预缓存的核心资源列表
var PRECACHE_URLS = ["/", "/offline", "/search"];

// ============================================================
// install 事件：首次注册或 SW 更新时触发
// 职责：预缓存核心页面资源，然后立即跳过等待激活
// ============================================================
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        // 将核心资源加入缓存，单个失败不影响整体（使用 addAll 的可选处理）
        return Promise.all(
          PRECACHE_URLS.map(function (url) {
            return cache.add(url).catch(function () {
              // 忽略单个资源缓存失败，保证 SW 安装继续
            });
          }),
        );
      })
      .then(function () {
        // 安装完成后立即跳过 waiting 阶段，让新 SW 立即接管
        return self.skipWaiting();
      }),
  );
});

// ============================================================
// activate 事件：新 SW 接管控制前触发
// 职责：清理旧版本缓存，并立即取得所有页面的控制权
// ============================================================
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        // 删除所有非当前版本的缓存
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(function () {
        // 立即取得控制权，无需等待下次页面刷新
        return self.clients.claim();
      }),
  );
});

// ============================================================
// fetch 事件：拦截所有网络请求
// 策略：仅处理 GET 请求 → Cache-First → 网络回退 → offline 兜底
// ============================================================
self.addEventListener("fetch", function (event) {
  var request = event.request;

  // 只处理 GET 请求，POST/PUT 等其他请求直接走网络
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cachedResponse) {
      // 策略1：命中缓存，直接返回缓存内容（Cache-First）
      if (cachedResponse) {
        return cachedResponse;
      }

      // 策略2：未命中缓存，尝试从网络获取
      return fetch(request)
        .then(function (networkResponse) {
          // 网络成功，但只缓存同源的成功响应
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            // 克隆响应（响应体是 ReadableStream，只能读一次）
            var responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(function () {
          // 策略3：网络失败，返回离线兜底页
          // 仅对导航请求（即页面跳转）兜底到 offline
          if (request.mode === "navigate") {
            return caches.match("/offline");
          }
        });
    }),
  );
});
