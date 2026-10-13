self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (error) {
    console.error('Could not parse lesson reminder push payload:', error);
  }

  event.waitUntil(self.registration.showNotification(
    payload.title || 'Time for your eSchool lesson',
    {
      body: payload.body || 'Your daily lesson reminder is here. Keep your learning going!',
      icon: '/teacher.jpg',
      data: { url: payload.url || '/lessons' },
      tag: 'eschool-daily-lesson-reminder',
      renotify: false,
    },
  ));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/lessons', self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    const existing = clients.find((client) => new URL(client.url).origin === self.location.origin);
    if (existing) {
      return existing.navigate(targetUrl).then(() => existing.focus());
    }
    return self.clients.openWindow(targetUrl);
  }));
});
