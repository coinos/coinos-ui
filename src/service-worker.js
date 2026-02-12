self.addEventListener("install", () => {});
self.addEventListener("activate", () => {});
self.addEventListener("fetch", () => {});
self.addEventListener("push", (event) => {
  const { title, body, url } = event.data.json();
  const icon = "/images/icon.png";
  const badge = "/images/badge.png";
  self.registration.showNotification(title, {
    body,
    icon,
    badge,
    data: { url },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});
