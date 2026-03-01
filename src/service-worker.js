import { Worker } from "@arkade-os/sdk";

const worker = new Worker();
// Only add message listener - we handle install/activate ourselves
worker.start(false).catch(console.error);

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

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
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
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
