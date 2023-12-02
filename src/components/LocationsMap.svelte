<script>
  import { tick, onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { Icon, Popup } from "$comp";
  import { shuffleArray } from "$lib/utils";

  import "maplibre-gl/dist/maplibre-gl.css";

  export let locations;
  let map;
  let mapContainer, mapWrapper;
  let markers = [];

  let currentIndex = -1;
  let timeout;

  let full = () => {
    if (!document.fullscreenElement) {
      if (mapWrapper.requestFullscreen) {
        mapWrapper.requestFullscreen();
      } else if (mapWrapper.mozRequestFullScreen) {
        /* Firefox */
        mapWrapper.mozRequestFullScreen();
      } else if (mapWrapper.webkitRequestFullscreen) {
        /* Chrome, Safari & Opera */
        mapWrapper.webkitRequestFullscreen();
      } else if (mapWrapper.msRequestFullscreen) {
        /* IE/Edge */
        mapWrapper.msRequestFullscreen();
      }

      map.resize();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        /* IE/Edge */
        document.msExitFullscreen();
      }
    }
  };

  function select(m) {
    stopFlying();
    currentIndex = inview.indexOf(m);
    flyToMarker(m);
  }

  async function flyToMarker(marker) {
    map.flyTo({
      zoom: 12,
      center: marker.getLngLat(),
      essential: true,
      easing: function (t) {
        return 1 - Math.pow(1 - t, 3);
      },
      duration: 3000,
    });

    await new Promise((r) => setTimeout(r, 3000));
    marker.getElement().click();
    await new Promise((r) => setTimeout(r, 1500));

    if (!timeout) return;

    map.flyTo({
      zoom: 10.5,
      center: marker.getLngLat(),
      essential: true,
      easing: function (t) {
        return 1 - Math.pow(1 - t, 3);
      },
      duration: 1500,
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

    timeout = setTimeout(startFlying, 6000);
  }

  function stopFlying() {
    if (!timeout) return;
    timeout = clearTimeout(timeout);

    if (currentPopup) {
      currentPopup.remove();
    }

    map.jumpTo({ center: map.getCenter(), zoom: map.getZoom() });
    map.off("moveend"); // Remove moveend listener if set
  }

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
    shuffleArray(inview);
  }

  let popups = {};
  let counter = 0;

  onMount(() => {
    if (browser) {
      import("maplibre-gl").then(({ default: maplibre }) => {
        map = new maplibre.Map({
          container: mapContainer,
          style: "https://tiles.stadiamaps.com/styles/stamen_toner.json",
          center: [-123.05, 49.26],
          zoom: 10.5,
        });

        map.on("load", () => {
          locations.forEach((location) => {
            if (location["deleted_at"]) return;

            let { lat, lon, tags } = location["osm_json"];
            if (!(lat && lon)) return;

            let element = document.createElement("div");
            element.className = "marker";

            let popupContainer = document.createElement("div");

            let popup = new Popup({
              target: popupContainer,
              props: { tags },
            });

            let marker = new maplibre.Marker({ color: "#F7931A" })
              .setLngLat([lon, lat])
              .setPopup(new maplibre.Popup().setDOMContent(popupContainer))
              .addTo(map);

            marker.id = counter++;

            marker.getElement().addEventListener("click", () => {
              let p = marker.getPopup();
              popups[marker.id] = p;
              p.setDOMContent(popupContainer);
              p.on("close", () => {
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

        map.on("mousedown", stopFlying);
        map.on("touchstart", stopFlying);
        map.on("wheel", stopFlying);
        map.on("dragstart", stopFlying);

        let resize = () => map && map.resize();

        document.addEventListener("fullscreenchange", resize, false);
        document.addEventListener("webkitfullscreenchange", resize, false);
        document.addEventListener("mozfullscreenchange", resize, false);
        document.addEventListener("MSFullscreenChange", resize, false);
      });
    }
  });

  onDestroy(() => map && map.remove());
</script>

<div class="container mx-auto p-2 space-y-5">
  <div class="flex w-full h-[60vh]" id="map" bind:this={mapWrapper}>
    <div
      id="map-container"
      class="mx-auto h-full w-full z-0"
      bind:this={mapContainer}
    />
    <div class="relative">
      <div class="flex absolute flex top-2 right-2 gap-2">
        <button
          class="rounded-full border-2 border-black bg-white w-10 h-10"
          on:click={toggle}
        >
          {#if timeout}
            <Icon icon="pause" style="w-4 m-auto" />
          {:else}
            <Icon icon="play" style="w-4 m-auto" />
          {/if}
        </button>
        <button
          class="rounded-full border-2 border-black bg-white w-10 h-10"
          on:click={full}
        >
          <Icon icon="full" style="w-4 m-auto" />
        </button>
      </div>
    </div>
  </div>

  <!-- <div class="hidden lg:grid grid-cols-3 justify-items-center"> -->
  <!-- 	{#each inview as m} -->
  <!-- 		<button -->
  <!-- 			on:click={() => select(m)} -->
  <!-- 			class="text-left" -->
  <!-- 			class:font-bold={m.id === inview[currentIndex]?.id} -->
  <!-- 			id={`marker-${m.id}`}>{m.tags.name}</button -->
  <!-- 		> -->
  <!-- 	{/each} -->
  <!-- </div> -->
</div>

<style>
  #map:fullscreen,
  #map-container:fullscreen {
    width: 100% !important;
    height: 100% !important;
  }

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
