<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let mapElement;
	let map;

	onMount(async () => {
		if (browser) {
			const L = await import('leaflet');
			const { MarkerClusterGroup } = await import('leaflet.markercluster');

			map = L.map(mapElement, { attributionControl: false }).setView([0, 0], 0);

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
					lng: -123.141373,
					info: 'Rolf Vancouver <br> 1628 W 1st Ave #231, Vancouver <br> <a href="https://www.rolfbodywork.com" target="_blank" rel="noreferrer">www.rolfbodywork.com</a>'
				},
				{ lat: 49.26419, lng: -123.15702, info: 'Tacos Jorge <br> 2287 W Broadway, Vancouver' },
				{
					lat: 49.28273,
					lng: -123.120735,
					info: 'Engage Strategies <br> <a href="https://www.linkedin.com/in/shauna-collister-32905214" target="_blank" rel="noreferrer">LinkedIn</a>'
				},
				{
					lat: 49.28134,
					lng: -123.02373,
					info: 'Lumota Collection <br> Clothing Design/Upcycling - Appointment Only <br> <a href="tel:778-726-3776">778-726-3776</a> <br> 369 Boundary Rd, Vancouver, BC V5K 2B1 <br> <a href="https://www.instagram.com/lumotacollection/" target="_blank" rel="noreferrer">IG: Lumotacollection</a> <br> <a href="https://www.facebook.com/LumotaCollection/posts" target="_blank" rel="noreferrer">FB: Lumotacollection</a>'
				},
				{
					lat: 49.22643,
					lng: -122.93085,
					info: 'Goodwin Contracting <br> Project Management/Consulting - Appointment Only <br> <a href="tel:403-812-1085">403-812-1085</a> <br> 8017 17th Ave, Burnaby, BC V3N 1M5'
				},
				{
					lat: 51.04813,
					lng: -114.07999,
					info: 'Goodwin Contracting <br> Project Management/Consulting - Appointment Only <br> <a href="tel:403-812-1085">403-812-1085</a> <br> 8017 17th Ave, Burnaby, BC V3N 1M5'
				},
				{
					lat: 49.2677,
					lng: -123.10124,
					info: 'General Strike Coffee <br> Artisan coffee shop <br> 1965 Main St, Vancouver, BC V5T 2K6 <br> <a href="https://www.instagram.com/generalstrikecoffee/" target="_blank" rel="noreferrer">IG: generalstrikecoffee</a>'
				}
			];

			L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
				maxZoom: 19,
				subdomains: ['a', 'b', 'c', 'd']
			}).addTo(map);

			let markers = new MarkerClusterGroup();
			locations.forEach(({ lat, lng, info }) => {
				let marker = L.marker([lat, lng]);

				marker.addTo(map).bindPopup(info)._icon.classList.add('huechange');
				markers.addLayer(marker);
			});

			map.fitBounds(locations.map(({ lat, lng }) => [lat, lng]));
			map.addLayer(markers);
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
	@import 'leaflet.markercluster/dist/MarkerCluster.css';
</style>
