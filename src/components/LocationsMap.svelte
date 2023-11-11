<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import html2canvas from 'html2canvas';
	import { Icon } from '$comp';

	import 'maplibre-gl/dist/maplibre-gl.css';

	export let locations;
	let map;
	let mapContainer;
	let markers = [];

	let currentIndex = -1;
	let timeout;

	function select(m) {
		stopFlying();
		currentIndex = inview.indexOf(m);
		flyToMarker(m);
	}

	async function flyToMarker(marker) {
		marker.getElement().click();

		map.flyTo({
			zoom: 14,
			center: marker.getLngLat(),
			essential: true,
			easing: function (t) {
				return 1 - Math.pow(1 - t, 3);
			},
			duration: 5000
		});

		await new Promise((r) => setTimeout(r, 5000));

		if (!timeout) return;

		map.flyTo({
			zoom: 10.5,
			center: marker.getLngLat(),
			essential: true,
			easing: function (t) {
				return 1 - Math.pow(1 - t, 3);
			},
			duration: 2000
		});
	}

	let toggle = () => {
		if (timeout) stopFlying();
		else startFlying();
	};

	let currentPopup;
	function startFlying() {
		currentIndex++;

		for (let p in popups) popups[p].remove();
		if (currentIndex >= inview.length) currentIndex = 0;
		flyToMarker(inview[currentIndex]);

		timeout = setTimeout(startFlying, 7000);
	}

	function stopFlying() {
		if (!timeout) return;
		timeout = clearTimeout(timeout);

		if (currentPopup) {
			currentPopup.remove();
		}

		map.jumpTo({ center: map.getCenter(), zoom: map.getZoom() });
		map.off('moveend'); // Remove moveend listener if set
	}

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

	let inview = [];

	function updateLabelVisibility() {
		inview = [];
		if (!map) return;
		let zoom = map.getZoom();
		let bounds = map.getBounds();

		for (let marker of markers) {
			let isInView = bounds.contains(marker.getLngLat());
			let { tags } = marker;

			if (isInView) {
				inview.push(marker);
			}
		}

		inview = inview.sort((a, b) => a.tags.name.localeCompare(b.tags.name));
	}

	let html = (tags) => `${
		tags && tags.name ? `<span class='block font-bold'>${tags.name}</span>` : ''
	}

  <span class='block'>${tags && checkAddress(tags)}</span>

  ${tags && tags.phone ? `<a href='tel:${tags.phone}' class='block'>${tags.phone}</a>` : ''}

  ${
		tags && tags.website
			? `<a href=${tags.website} target="_blank" rel="noreferrer" class='block text-blue-400 break-all'>${tags.website}</a>`
			: ''
	}`;

	let popups = {};
	let counter = 0;

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
						if (!(lat && lon)) return;

						let element = document.createElement('div');
						element.className = 'marker';

						let marker = new maplibre.Marker({ color: '#F7931A' })
							.setLngLat([lon, lat])
							.setPopup(new maplibre.Popup().setHTML(html(tags)))
							.addTo(map);

						marker.id = counter++;

						marker.getElement().addEventListener('click', () => {
							let h = html(marker.tags);
							let p = marker.getPopup();
							popups[marker.id] = p;
							p.setHTML(h);
							p.on('close', () => {
								delete popups[marker.id];
							});
						});

						marker.tags = tags;

						markers.push(marker);
					});

					updateLabelVisibility();

					let observer = new IntersectionObserver(
						(entries, observer) => {
							entries.forEach((entry) => {
								if (entry.isIntersecting) startFlying();
								else stopFlying();
							});
						},
						{ threshold: 0.5 }
					);

					observer.observe(mapContainer);
				});

				map.on('mousedown', stopFlying);
				map.on('touchstart', stopFlying);
				map.on('wheel', stopFlying);
				map.on('dragstart', stopFlying);
			});
		}
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div class="container mx-auto max-w-4xl">
	<div class="flex w-full">
		<div class="mx-auto h-[550px] w-full z-0" bind:this={mapContainer} />
		<div class="relative">
			<button
				class="absolute flex top-2 right-2 rounded-full border-2 border-black bg-white w-10 h-10"
				on:click={toggle}
			>
				{#if timeout}
					<Icon icon="pause" style="w-4 m-auto" />
				{:else}
					<Icon icon="play" style="w-4 m-auto" />
				{/if}
			</button>

			<div class="absolute bottom-2 right-2 w-60 h-60 bg-white overflow-y-scroll p-4 bg-opacity-80">
				{#each inview as m}
					<button
						on:click={() => select(m)}
						class="text-left"
						class:font-bold={m.id === inview[currentIndex]?.id}
						id={`marker-${m.id}`}>{m.tags.name}</button
					>
				{/each}
			</div>
		</div>
	</div>

	{inview.length}
</div>

<style>
	:global(.maplibregl-popup-close-button) {
		font-size: 24px;
		padding: 8px;
	}

	:global(.maplibregl-popup :focus) {
		outline: none;
	}

	:global(.maplibregl-ctrl-attrib) {
		display: none;
	}

	:global(.maplibregl-popup-content) {
		padding: 1em 2em;
		border-radius: 4px;
		font-size: 14px;
		color: black;
		background-color: white;
		overflow: hidden;
		width: 280px;
	}
</style>
