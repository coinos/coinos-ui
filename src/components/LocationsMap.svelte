<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let mapElement;
	let map;

	onMount(async () => {
		if (browser) {
			const leaflet = await import('leaflet');

			// this sets the inital view of the map on page load
			map = leaflet.map(mapElement).setView([49.267265, -123.1491965], 13);

			leaflet
				.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					maxZoom: 19,
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
				})
				.addTo(map);

			// business locations
			leaflet
				.marker([49.27034, -123.141373])
				.addTo(map)
				.bindPopup(
					'Rolf Vancouver <br> 1628 W 1st Ave #231, Vancouver <br> <a href="https://www.rolfbodywork.com" target="_blank" rel="noreferrer">www.rolfbodywork.com</a>'
				);

			leaflet
				.marker([49.26419, -123.15702])
				.addTo(map)
				.bindPopup('Tacos Jorge <br> 2287 W Broadway, Vancouver');
		}
	});

	onDestroy(async () => {
		if (map) {
			console.log('Unloading Leaflet map.');
			map.remove();
		}
	});
</script>

<div
	class="mx-auto w-full md:w-11/12 lg:w-3/4 2xl:w-1/2 max-w-7xl h-[450px] z-0"
	bind:this={mapElement}
/>

<style>
	@import 'leaflet/dist/leaflet.css';
</style>
