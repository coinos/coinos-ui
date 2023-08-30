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

	onMount(async () => {
		if (browser) {
			const L = await import('leaflet');

			map = L.map(mapElement, {
				zoomSnap: 0,
				zoomControl: false,
				attributionControl: false
			}).setView([49.26, -123.05], 12.5);

			const myCustomColour = '#F7931A';

			const markerHtmlStyles = `
			  background-color: ${myCustomColour};
			  width: 2rem;
			  height: 2rem;
			  display: block;
			  position: relative;
        border-radius: 100% 100% 0;
			  transform: rotate(45deg);
        opacity: 0.9;
			  border: 5px solid #000`;

			const icon = L.divIcon({
				className: 'my-custom-pin',
				iconAnchor: [0, 24],
				labelAnchor: [-6, 0],
				popupAnchor: [0, -36],
				html: `<span style="${markerHtmlStyles}" />`
			});

			const mapBounds = map.getBounds();

			const southWest = mapBounds.getSouthWest();
			const northEast = mapBounds.getNorthEast();

			locations = locations.filter(
				(location) =>
					location['osm_json'].tags &&
					location['osm_json'].tags['payment:coinos'] === 'yes' &&
					location['osm_json'].lat &&
					location['osm_json'].lon &&
					location['osm_json'].lat > southWest.lat &&
					location['osm_json'].lat <= northEast.lat &&
					location['osm_json'].lon > southWest.lng &&
					location['osm_json'].lon <= northEast.lng
			);

			console.log('Southwest corner:', southWest);
			console.log('Northeast corner:', northEast);

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
		}
	});

	let positionTooltips = () => {
		const MAX_ITERATIONS = 1000;
		const REPULSION_STRENGTH = 0.05;
		const SPRING_STRENGTH = 0.02;
		const MAX_DISTANCE = 120; // maximum distance a tooltip is allowed to drift from its marker

		// Get all tooltips
		const tooltips = document.querySelectorAll('.leaflet-tooltip');

		// Convert NodeList to Array for easier operations
		const tooltipArray = Array.from(tooltips);

		// Initial setup for each tooltip
tooltipArray.forEach(tooltip => {
    const computedStyle = getComputedStyle(tooltip);
    const markerX = parseFloat(computedStyle.left);
    const markerY = parseFloat(computedStyle.top);

    tooltip.desiredX = markerX;
    tooltip.desiredY = markerY;
    tooltip.velocityX = 0;
    tooltip.velocityY = 0;
});

		for (let i = 0; i < MAX_ITERATIONS; i++) {
			tooltipArray.forEach((tooltipA) => {
				let forceX = 0,
					forceY = 0;

				// Calculate repulsion from all other tooltips
				tooltipArray.forEach((tooltipB) => {
					if (tooltipA !== tooltipB) {
						const rectA = tooltipA.getBoundingClientRect();
						const rectB = tooltipB.getBoundingClientRect();

						let dx = rectA.x - rectB.x;
						let dy = rectA.y - rectB.y;
						let distance = Math.sqrt(dx * dx + dy * dy);

						if (distance < Math.max(rectA.width, rectA.height)) {
							// Adjust this threshold if necessary
							forceX += (dx / distance) * REPULSION_STRENGTH;
							forceY += (dy / distance) * REPULSION_STRENGTH;
						}
					}
				});

				// Apply spring force towards desired position
				let dx = tooltipA.desiredX - tooltipA.offsetLeft;
				let dy = tooltipA.desiredY - tooltipA.offsetTop;

				forceX += dx * SPRING_STRENGTH;
				forceY += dy * SPRING_STRENGTH;

				// Update position
				tooltipA.style.left = `${tooltipA.offsetLeft + forceX}px`;
				tooltipA.style.top = `${tooltipA.offsetTop + forceY}px`;

				// Ensure tooltip doesn't move too far from its marker
				let dxFromDesired = tooltipA.offsetLeft - tooltipA.desiredX;
				let dyFromDesired = tooltipA.offsetTop - tooltipA.desiredY;
				let distanceFromDesired = Math.sqrt(
					dxFromDesired * dxFromDesired + dyFromDesired * dyFromDesired
				);

				if (distanceFromDesired > MAX_DISTANCE) {
					tooltipA.style.left = `${tooltipA.desiredX}px`;
					tooltipA.style.top = `${tooltipA.desiredY}px`;
				}
			});
		}
	};

	onDestroy(async () => map && map.remove());
</script>

<!-- <div class="mx-auto w-[14043px] h-[9933px] w-full z-0" bind:this={mapElement} /> -->
<div class="mx-auto w-[1000px] h-[600px] w-full z-0" bind:this={mapElement} />

<button on:click={positionTooltips}>Iterate</button>

<style>
	@import 'leaflet/dist/leaflet.css';

	:global(.leaflet-tooltip) {
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: bolder;
		color: black;
		background-color: rgba(255, 255, 255, 0.5);
	}
</style>
