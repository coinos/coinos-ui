/// <reference types="@sveltejs/kit" />
import { build, files, version } from "$service-worker";

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	...build, // the app itself
	...files, // everything in `static`
];

self.addEventListener("install", (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener("activate", (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

self.addEventListener("fetch", (event) => {
	// Ignore non-GET requests
	if (event.request.method !== "GET") return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// Check for a cached response
		const cachedResponse = await cache.match(event.request);

		// If cached, attempt a conditional request with `If-None-Match`
		if (cachedResponse) {
			const etag = cachedResponse.headers.get("ETag");
			const fetchOptions = etag
				? {
						headers: {
							"If-None-Match": etag,
						},
				  }
				: {};

			try {
				const networkResponse = await fetch(event.request, fetchOptions);

				if (networkResponse.status === 200) {
					// Update cache and return the new response
					cache.put(event.request, networkResponse.clone());
					return networkResponse;
				}

				if (networkResponse.status === 304) {
					// Return cached response if not modified
					return cachedResponse;
				}
			} catch (err) {
				console.error("Network error:", err);
				// Fall back to cached response if the network fails
				return cachedResponse;
			}
		}

		// If no cache, fetch the resource and store it if successful
		try {
			const networkResponse = await fetch(event.request);
			if (networkResponse.status === 200) {
				cache.put(event.request, networkResponse.clone());
			}
			return networkResponse;
		} catch (err) {
			console.error("Fetch failed and no cache available:", err);
			throw err; // No fallback available
		}
	}

	event.respondWith(respond());
});

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
