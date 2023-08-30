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

			tooltips = Array.from(document.querySelectorAll('.leaflet-tooltip'));
		}
	});

	const tenIterations = () => {
		let anyAdjustment = true;
		for (let i = 0; i < 10; i++) {
			if (anyAdjustment) iterate();
			else break;
		}
	};

	const iterate = () => {
		let anyAdjustment = false;

		for (const tooltipA of tooltips) {
			for (const tooltipB of tooltips) {
				if (tooltipA === tooltipB) continue;

				if (areOverlapping(getBoundingRect(tooltipA), getBoundingRect(tooltipB))) {
					const originalPosA = {
						top: parseInt(tooltipA.dataset.originalTop, 10),
						left: parseInt(tooltipA.dataset.originalLeft, 10)
					};
					const direction = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];

					adjustPosition(tooltipA, direction);

					const adjustedPosA = {
						top: parseInt(tooltipA.style.top, 10),
						left: parseInt(tooltipA.style.left, 10)
					};
					console.log(adjustedPosA);
					const distanceFromOriginalA = Math.sqrt(
						Math.pow(adjustedPosA.top - originalPosA.top, 2) +
							Math.pow(adjustedPosA.left - originalPosA.left, 2)
					);

					console.log('DIST', distanceFromOriginalA);

					if (distanceFromOriginalA > MAX_DISTANCE) {
						// If tooltip has strayed too far from the marker, revert the last movement.
						adjustPosition(
							tooltipA,
							{
								up: 'down',
								down: 'up',
								left: 'right',
								right: 'left'
							}[direction]
						);
					} else {
						anyAdjustment = true;
					}
				}
			}
		}

		return anyAdjustment;
	};

	const MAX_ITERATIONS = 80;
	const MAX_DISTANCE = 300; // maximum distance from the marker
	const ADJUSTMENT_FACTOR = 10;

	let tooltips;

	const getBoundingRect = (elem) => {
		return elem.getBoundingClientRect();
	};

	const areOverlapping = (rect1, rect2) => {
		return !(
			rect1.right < rect2.left ||
			rect1.left > rect2.right ||
			rect1.bottom < rect2.top ||
			rect1.top > rect2.bottom
		);
	};

	const adjustPosition = (tooltip, direction) => {
		let computedStyle = getComputedStyle(tooltip);
		const currentTop = parseInt(computedStyle.top);
		const currentLeft = parseInt(computedStyle.left);
		// console.log(currentTop, currentLeft);
		switch (direction) {
			case 'up':
				tooltip.style.top = currentTop - ADJUSTMENT_FACTOR + 'px';
				break;
			case 'down':
				tooltip.style.top = currentTop + ADJUSTMENT_FACTOR + 'px';
				break;
			case 'left':
				tooltip.style.left = currentLeft - ADJUSTMENT_FACTOR + 'px';
				break;
			case 'right':
				tooltip.style.left = currentLeft + ADJUSTMENT_FACTOR + 'px';
				break;
		}
	};

	function initializeGrid(tooltips) {
		const grid = [];
		const gridSize = 10; // Adjust based on how granular you want the grid to be.

    console.log(tooltips.length)

		tooltips.forEach((tooltip) => {
			const style = getComputedStyle(tooltip);

			const position = {
				left: parseInt(style.left, 10),
				top: parseInt(style.top, 10)
			};

			const size = {
				width: parseInt(style.width, 10),
				height: parseInt(style.height, 10)
			};

			for (let y = position.top; y < position.top + size.height; y += gridSize) {
				for (let x = position.left; x < position.left + size.width; x += gridSize) {
					const key = `${Math.floor(x / gridSize)}-${Math.floor(y / gridSize)}`;
					grid[key] = true;
				}
			}
		});

		return grid;
	}

	function checkOverlap(position, size, grid, gridSize = 10) {
		for (let y = position.top; y < position.top + size.height; y += gridSize) {
			for (let x = position.left; x < position.left + size.width; x += gridSize) {
				const key = `${Math.floor(x / gridSize)}-${Math.floor(y / gridSize)}`;
				if (grid[key]) return true;
			}
		}
		return false;
	}

	function findClosestAvailableSpace(position, size, grid, gridSize = 10) {
		let bestPosition = null;
		let bestDistance = Infinity;

		for (let y = 0; y < window.innerHeight; y += gridSize) {
			for (let x = 0; x < window.innerWidth; x += gridSize) {
				const testPosition = { left: x, top: y };
				if (!checkOverlap(testPosition, size, grid, gridSize)) {
					const distance = Math.sqrt(
						Math.pow(position.left - testPosition.left, 2) +
							Math.pow(position.top - testPosition.top, 2)
					);

					if (distance < bestDistance) {
						bestDistance = distance;
						bestPosition = testPosition;
					}
				}
			}
		}

		return bestDistance < MAX_DISTANCE ? bestPosition : position;
	}

	function positionTooltips() {
    console.log("HI");
		const grid = initializeGrid(tooltips);
		const gridSize = 10;

    console.log("GRID", grid)

		tooltips.forEach((tooltip) => {
			const style = getComputedStyle(tooltip);

			const position = {
				left: parseInt(style.left, 10),
				top: parseInt(style.top, 10)
			};

			const size = {
				width: parseInt(style.width, 10),
				height: parseInt(style.height, 10)
			};

			const overlap = checkOverlap(position, size, grid, gridSize);
      console.log("OVERLAP", overlap, tooltip.innerHTML)
			if (overlap) {
				const newSpace = findClosestAvailableSpace(position, size, grid, gridSize);
				if (newSpace) {
          console.log("NEWSPACE", newSpace)
					tooltip.style.left = newSpace.left + 'px';
					tooltip.style.top = newSpace.top + 'px';

					for (let y = position.top; y < position.top + size.height; y += gridSize) {
						for (let x = position.left; x < position.left + size.width; x += gridSize) {
							const key = `${Math.floor(x / gridSize)}-${Math.floor(y / gridSize)}`;
							grid[key] = false;
						}
					}

					// Updating grid with new tooltip position
					for (let y = newSpace.top; y < newSpace.top + size.height; y += gridSize) {
						for (let x = newSpace.left; x < newSpace.left + size.width; x += gridSize) {
							const key = `${Math.floor(x / gridSize)}-${Math.floor(y / gridSize)}`;
							grid[key] = true;
						}
					}
				}
			}
		});
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
