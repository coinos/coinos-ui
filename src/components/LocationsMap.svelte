<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import html2canvas from 'html2canvas';

	import 'maplibre-gl/dist/maplibre-gl.css';

	export let locations;
	let map;
	let mapContainer;
	let markers = [];

	let checkAddress = (location) => {
		if (location['addr:housenumber'] && location['addr:street'] && location['addr:city']) {
			return `${
				location['addr:housenumber'] + ' ' + location['addr:street'] + ', ' + location['addr:city']
			}`;
		} else if (location['addr:street'] && location['addr:city']) {
			return `${location['addr:street'] + ', ' + location['addr:city']}`;
		} else if (location['addr:city']) {
			return `${location['addr:city']}`;
		} else {
			return '';
		}
	};

	function updateLabelVisibility() {
		if (!map) return;
		let zoom = map.getZoom();
		let bounds = map.getBounds();

		for (let marker of markers) {
			let isInView = bounds.contains(marker.getLngLat());
			let popup = marker.getPopup();
			let { tags } = marker;

			if (zoom > 13 && isInView) {
				popup.setHTML(`<span class='block font-bold'>${tags.name}</span>`).addTo(map);
			} else {
        popup.remove();
				popup.setHTML(html(tags));
			}
		}
	}

	let html = (tags) => `${
		tags && tags.name ? `<span class='block font-bold'>${tags.name}</span>` : ''
	}

  <span class='block'>${tags && checkAddress(tags)}</span>

  ${tags && tags.phone ? `<a href='tel:${tags.phone}' class='block'>${tags.phone}</a>` : ''}

  ${
		tags && tags.website
			? `<a href=${tags.website} target="_blank" rel="noreferrer" class='block text-blue-400'>${tags.website}</a>`
			: ''
	}`;

	onMount(() => {
		if (browser) {
			import('maplibre-gl').then(({ default: maplibre }) => {
				map = new maplibre.Map({
					container: mapContainer,
					style: 'https://tiles.stadiamaps.com/styles/stamen_toner.json',
					center: [-123.05, 49.26],
					zoom: 10.5
				});

				map.on('load', () => {
					locations.forEach((location) => {
						if (location['deleted_at']) return;

						let { lat, lon, tags } = location['osm_json'];

						let element = document.createElement('div');
						element.className = 'marker';

						let marker = new maplibre.Marker({ color: '#F7931A' })
							.setLngLat([lon, lat])
							.setPopup(new maplibre.Popup().setHTML(html(tags)))
							.addTo(map);

						marker.getElement().addEventListener('click', () => {
              let h = html(marker.tags);
							let popup = marker.getPopup();
              popup.setHTML(h);
						});

						marker.tags = tags;

						markers.push(marker);
					});

					updateLabelVisibility();
					map.on('moveend', updateLabelVisibility);
					map.on('zoomend', updateLabelVisibility);
				});
			});
		}
	});

	onDestroy(() => {
		if (map) {
			map.off('moveend', updateLabelVisibility);
			map.off('zoomend', updateLabelVisibility);
			map.remove();
		}
	});
</script>

<div class="container mx-auto max-w-4xl">
	<div class="flex w-full">
		<div class="mx-auto h-[550px] w-full z-0" bind:this={mapContainer} />
	</div>
</div>

<style>
	:global(.maplibregl-popup-close-button) {
		font-size: 18px;
		padding: 8px;
	}

	:global(.maplibregl-popup-content) {
		padding: 0.5em 1em;
		border: 1px solid black;
		border-radius: 4px;
		font-size: 14px;
		color: black;
		background-color: white;
		overflow: hidden;
	}
</style>
