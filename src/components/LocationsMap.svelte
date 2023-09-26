<script>
	export let locations;

	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	import html2canvas from 'html2canvas';

	function captureHighResMap(mapElement, scale = 2) {
		// Backup original size
		let originalWidth = mapElement.offsetWidth;
		let originalHeight = mapElement.offsetHeight;

		// Scale the map element
		mapElement.style.transform = `scale(${scale})`;
		mapElement.style.transformOrigin = 'top left';
		mapElement.style.width = originalWidth * scale + 'px';
		mapElement.style.height = originalHeight * scale + 'px';

		return html2canvas(mapElement, {
			width: originalWidth * scale,
			height: originalHeight * scale,
			scale: scale
		}).then((canvas) => {
			// Restore the original size
			mapElement.style.transform = '';
			mapElement.style.width = originalWidth + 'px';
			mapElement.style.height = originalHeight + 'px';

			return canvas;
		});
	}

	let mapElement;
	let map;

	function updateLabelVisibility() {
		const zoom = map.getZoom();
		map.eachLayer((layer) => {
			if (layer.getTooltip) {
				const tooltip = layer.getTooltip();
				if (tooltip) {
					if (zoom > 14) {
						// Show labels at zoom levels greater than 14
						tooltip.setOpacity(1.0);
					} else {
						tooltip.setOpacity(0.0);
					}
				}
			}
		});
	}

	onMount(async () => {
		if (browser) {
			const L = await import('leaflet');

			map = L.map(mapElement, {
				zoomSnap: 0,
				attributionControl: false
			}).setView([49.26, -123.05], 12);

			const myCustomColour = '#F7931A';

			const markerHtmlStyles = `
			  background-color: ${myCustomColour};
			  width: 1.2rem;
			  height: 1.2rem;
			  display: block;
			  position: relative;
        border-radius: 100% 100% 0;
			  transform: rotate(45deg);
        opacity: 0.9;
			  border: 1px solid #666`;

			const icon = L.divIcon({
				className: 'my-custom-pin',
				iconAnchor: [0, 24],
				labelAnchor: [-6, 0],
				popupAnchor: [0, -36],
				html: `<span style="${markerHtmlStyles}" />`
			});

			locations = locations.filter(
				(location) =>
					location['osm_json'].tags &&
					location['osm_json'].tags['payment:coinos'] === 'yes' &&
					location['osm_json'].lat &&
					location['osm_json'].lon
			);

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

			locations.forEach((location) => {
				if (location['deleted_at']) return;

				location = location['osm_json'];
				let marker = L.marker([location.lat, location.lon], { icon });

				if (location.tags && location.tags.name) {
					marker.bindTooltip(location.tags.name, { permanent: true }).openTooltip();
				}

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
				marker.addTo(map);
			});

			updateLabelVisibility();
			map.on('zoomend', updateLabelVisibility);
			// map.fitBounds(locations.map(({ osm_json: { lat, lon } }) => [lat, lon]));
		}
	});

	onDestroy(async () => {
		map.off('zoomend', updateLabelVisibility);
		map && map.remove();
	});
</script>

<div class="container mx-auto max-w-4xl">
	<div class="flex w-full">
		<div class="mx-auto h-[550px] w-full z-0" bind:this={mapElement} />
	</div>
</div>

<style>
	@import 'leaflet/dist/leaflet.css';

	:global(.leaflet-tooltip) {
		border: none;
		border-radius: 4px;
		font-size: 12px;
		font-weight: bolder;
		color: black;
		background-color: rgba(255, 255, 255, 0.9);
    left: 1.3rem;
    top: -1rem;
	}
</style>
