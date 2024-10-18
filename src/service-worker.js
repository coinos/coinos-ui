import { build, files, version } from "$service-worker";

self.addEventListener("install", (event) => {});
self.addEventListener("activate", (event) => {});
self.addEventListener("fetch", (event) => {});
self.addEventListener("push", (event) => {
	const pushData = event.data.json();
	self.registration.showNotification(pushData.title, pushData);
});
