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

			const locations = [
				{
					lat: 49.27034,
					long: -123.141373,
					info: 'Rolf Vancouver <br> 1628 W 1st Ave #231, Vancouver <br> <a href="https://www.rolfbodywork.com" target="_blank" rel="noreferrer">www.rolfbodywork.com</a>'
				},
				{ lat: 49.26419, long: -123.15702, info: 'Tacos Jorge <br> 2287 W Broadway, Vancouver' },
				{
					lat: 49.28273,
					long: -123.120735,
					info: 'Engage Strategies <br> <a href="https://www.linkedin.com/in/shauna-collister-32905214" target="_blank" rel="noreferrer">LinkedIn</a>'
				},
				{
					lat: 49.28134,
					long: -123.02373,
					info: 'Lumota Collection <br> Clothing Design/Upcycling - Appointment Only <br> <a href="tel:778-726-3776">778-726-3776</a> <br> 369 Boundary Rd, Vancouver, BC V5K 2B1 <br> <a href="https://www.instagram.com/lumotacollection/" target="_blank" rel="noreferrer">IG: Lumotacollection</a> <br> <a href="https://www.facebook.com/LumotaCollection/posts" target="_blank" rel="noreferrer">FB: Lumotacollection</a>'
				},
				{
					lat: 49.22643,
					long: -122.93085,
					info: 'Goodwin Contracting <br> Project Management/Consulting - Appointment Only <br> <a href="tel:403-812-1085">403-812-1085</a> <br> 8017 17th Ave, Burnaby, BC V3N 1M5'
				},
				{
					lat: 51.04813,
					long: -114.07999,
					info: 'Goodwin Contracting <br> Project Management/Consulting - Appointment Only <br> <a href="tel:403-812-1085">403-812-1085</a> <br> 8017 17th Ave, Burnaby, BC V3N 1M5'
				}
			];

			leaflet
				.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
					maxZoom: 19,
					subdomains: ['a', 'b', 'c', 'd']
				})
				.addTo(map);

			locations.forEach((location) => {
				leaflet
					.marker([location.lat, location.long])
					.addTo(map)
					.bindPopup(location.info)
					._icon.classList.add('huechange');
			});
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
