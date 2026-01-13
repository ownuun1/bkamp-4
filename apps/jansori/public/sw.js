// Jansori Service Worker for Push Notifications

self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || '오늘 목표를 확인해보세요!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      goalId: data.goalId,
      url: data.url || '/dashboard',
    },
    actions: [
      { action: 'done', title: '했어요!' },
      { action: 'snooze', title: '나중에' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Jansori', options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const action = event.action;
  const url = event.notification.data?.url || '/dashboard';

  if (action === 'done') {
    // TODO: 완료 처리 API 호출
    console.log('User marked as done');
  }

  event.waitUntil(clients.openWindow(url));
});

// Service Worker 설치
self.addEventListener('install', function (event) {
  self.skipWaiting();
});

// Service Worker 활성화
self.addEventListener('activate', function (event) {
  event.waitUntil(clients.claim());
});
