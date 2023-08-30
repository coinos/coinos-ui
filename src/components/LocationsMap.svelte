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

      console.log("Southwest corner:", southWest);
      console.log("Northeast corner:", northEast);

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

	function doTooltipsOverlap(tooltip1, tooltip2) {
		const rect1 = tooltip1.getBoundingClientRect();
		const rect2 = tooltip2.getBoundingClientRect();

		return !(
			rect1.right < rect2.left ||
			rect1.left > rect2.right ||
			rect1.bottom < rect2.top ||
			rect1.top > rect2.bottom
		);
	}

	function resolveCollision(tooltip1, tooltip2) {
		const MAX_DISTANCE = 300; // Max distance a tooltip can move.

		const rect1 = tooltip1.getBoundingClientRect();
		const rect2 = tooltip2.getBoundingClientRect();

		const left = rect1.right - rect2.left;
		const right = rect1.left - rect2.right;
		const down = rect1.bottom - rect2.top;

		// Determine how much we would need to move in each direction to resolve the collision.
		const moveAmounts = {
			left: left > MAX_DISTANCE ? MAX_DISTANCE : left,
			right: Math.abs(right) > MAX_DISTANCE ? MAX_DISTANCE : right,
			down: down > MAX_DISTANCE ? MAX_DISTANCE : down
		};

		// Choose the direction that requires the least movement.
		const direction = Object.keys(moveAmounts).reduce((a, b) =>
			moveAmounts[a] < moveAmounts[b] ? a : b
		);

    console.log("MOVING", tooltip2.innerHTML, direction, moveAmounts[direction]);

		switch (direction) {
			case 'left':
				tooltip2.style.left = `${-moveAmounts.left}px`;
				break;
			case 'right':
        console.log(tooltip2.style.left);
				tooltip2.style.left = `${moveAmounts.right}px`;
        console.log(tooltip2.style.left);
				break;
			case 'down':
				tooltip2.style.top = `${moveAmounts.down}px`;
				break;
		}
	}

	function positionTooltips() {
		const tooltips = Array.from(document.querySelectorAll('.leaflet-tooltip'));

		// 1. Sort the rectangles by the x-axis, topmost first.
		tooltips.sort((a, b) => {
			const rectA = a.getBoundingClientRect();
			const rectB = b.getBoundingClientRect();
			return rectA.top - rectB.top;
		});

		// 2. For each rectangle r1, top to bottom.
		for (let i = 0; i < tooltips.length; i++) {
			const r1 = tooltips[i];

			// 3. For every other rectangle r2 that might intersect with it.
			for (let j = i + 1; j < tooltips.length; j++) {
				const r2 = tooltips[j];

				// 4. If r1 and r2 intersect.
				if (doTooltipsOverlap(r1, r2)) {
					// 5-8. Resolve the collision.
					resolveCollision(r1, r2);
				}
			}
		}
	}

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
