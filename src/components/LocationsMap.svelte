<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let mapElement;
	let map;

	onMount(async () => {
		if (browser) {
			const leaflet = await import('leaflet');

			map = leaflet.map(mapElement).setView([49.267265, -123.1491965], 13);

			const myCustomColour = 'orange';

			const markerHtmlStyles = `
  background-color: ${myCustomColour};
  width: 3rem;
  height: 3rem;
  display: block;
  left: -1.5rem;
  top: -1.5rem;
  position: relative;
  border-radius: 3rem 3rem 0;
  transform: rotate(45deg);
  border: 1px solid #FFFFFF`;

			const icon = L.divIcon({
				className: 'my-custom-pin',
				iconAnchor: [0, 24],
				labelAnchor: [-6, 0],
				popupAnchor: [0, -36],
				html: `<span style="${markerHtmlStyles}" />`
			});

			leaflet
				.tileLayer('http://{s}tile.stamen.com/toner/{z}/{x}/{y}.png', {
					// leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					maxZoom: 19,
					subdomains: ['', 'a.', 'b.', 'c.', 'd.'],
				})
				.addTo(map);

			// let tonerLayer = new L.StamenTileLayer("toner");
			// map.addLayer(tonerLayer);



			leaflet
				.marker([49.27034, -123.141373])
				.addTo(map)
				.bindPopup(
					'Rolf Vancouver <br> 1628 W 1st Ave #231, Vancouver <br> <a href="https://www.rolfbodywork.com" target="_blank" rel="noreferrer">www.rolfbodywork.com</a>'
				)._icon.classList.add("huechange");

			leaflet
				.marker([49.26419, -123.15702])
				.addTo(map)
				.bindPopup('Tacos Jorge <br> 2287 W Broadway, Vancouver')._icon.classList.add("huechange");
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
