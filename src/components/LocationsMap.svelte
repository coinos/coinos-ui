<script>
	export let locations;

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

			locations = locations.filter(
				(location) =>
					location['osm_json'].tags && location['osm_json'].tags['payment:hashme'] === 'yes'
			);

			/*	const locations = [
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
			];*/

			L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
				maxZoom: 18,
				subdomains: ['a', 'b', 'c', 'd']
			}).addTo(map);

			const checkAddress = (location) => {
				if (location['addr:housenumber'] && location['addr:street'] && location['addr:city']) {
					return `${
						location['addr:housenumber'] +
						' ' +
						location['addr:street'] +
						', ' +
						location['addr:city']
					}`;
				} else if (location['addr:street'] && location['addr:city']) {
					return `${location['addr:street'] + ', ' + location['addr:city']}`;
				} else if (location['addr:city']) {
					return `${location['addr:city']}`;
				} else {
					return '';
				}
			};

			let markers = new MarkerClusterGroup();
			locations.forEach((location) => {
				if (location['deleted_at']) {
					return;
				}

				location = location['osm_json'];

				let marker = L.marker([location.lat, location.lon]);

				marker.bindPopup(
					`${
						location.tags && location.tags.name
							? `<span class='block'>${location.tags.name}</span>`
							: ''
					}

          <span class='block'>${location.tags && checkAddress(location.tags)}</span>

          ${
						location.tags && location.tags.phone
							? `<a href='tel:${location.tags.phone}' class='block'>${location.tags.phone}</a>`
							: ''
					}

          ${
						location.tags && location.tags.website
							? `<a href=${location.tags.website} target="_blank" rel="noreferrer" class='block'>${location.tags.website}</a>`
							: ''
					}

					${
						location.tags && location.tags['contact:twitter']
							? `<a href=${
									location.tags['contact:twitter'].startsWith('http')
										? location.tags['contact:twitter']
										: `https://twitter.com/${location.tags['contact:twitter']}`
							  } target="_blank" rel="noreferrer" class='block'>TWT: ${
									location.tags['contact:twitter']
							  }</a>`
							: ''
					}

	        ${
						location.tags && location.tags['contact:instagram']
							? `<a href=${
									location.tags['contact:instagram'].startsWith('http')
										? location.tags['contact:instagram']
										: `https://instagram.com/${location.tags['contact:instagram']}`
							  } target="_blank" rel="noreferrer" class='block'>IG: ${
									location.tags['contact:instagram']
							  }</a>`
							: ''
					}

	        ${
						location.tags && location.tags['contact:facebook']
							? `<a href=${
									location.tags['contact:facebook'].startsWith('http')
										? location.tags['contact:facebook']
										: `https://facebook.com/${location.tags['contact:facebook']}`
							  } target="_blank" rel="noreferrer" class='block'>FB: ${
									location.tags['contact:facebook']
							  }</a>`
							: ''
					}

	        ${
						location.tags && location.tags['contact:linkedin']
							? `<a href=${
									location.tags['contact:linkedin'].startsWith('http')
										? location.tags['contact:linkedin']
										: `https://linkedin.com/${location.tags['contact:linkedin']}`
							  } target="_blank" rel="noreferrer" class='block'>LI: ${
									location.tags['contact:linkedin']
							  }</a>`
							: ''
					}`
				);
				markers.addLayer(marker);
			});

			map.fitBounds(locations.map(({ osm_json: { lat, lon } }) => [lat, lon]));
			map.addLayer(markers);
		}
	});

	onDestroy(async () => map && map.remove());
</script>

<div class="container mx-auto max-w-4xl">
	<div class="flex w-full">
		<div class="mx-auto h-[450px] w-full z-0" bind:this={mapElement} />
	</div>
</div>

<style>
	@import 'leaflet/dist/leaflet.css';
	@import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
</style>
