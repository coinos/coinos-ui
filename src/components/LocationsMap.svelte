<script>
  import { tick, onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import Icon from "$comp/Icon.svelte";
  import Popup from "$comp/Popup.svelte";
  import { back } from "$lib/utils";

  import "maplibre-gl/dist/maplibre-gl.css";

  export let locations;
  let map;
  let mapContainer, mapWrapper;
  let markers = [];
  let search;
  let clearSearch = (e) => (search = "");

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

  $: list = search
    ? markers.filter((m) =>
        m.tags.name.toLowerCase().includes(search.toLowerCase())
      )
    : inview;

  let scroll = () => {
    const el = document.querySelector(".selected");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  let selected;
  function select(m) {
    selected = m;
    stopFlying();
    currentIndex = inview.indexOf(m);
    flyToMarker(m, 500);
  }

  async function flyToMarker(marker, duration = 1500) {
    if (!marker) return;
    map.flyTo({
      zoom: 12,
      center: marker.getLngLat(),
      essential: true,
      easing: function (t) {
        return 1 - Math.pow(1 - t, 3);
      },
      duration,
    });

    await new Promise((r) => setTimeout(r, duration));
    marker.getElement().click();
    updateLabelVisibility();
    await new Promise((r) => setTimeout(r, 2500));

    if (!timeout) return;
    //
    // map.flyTo({
    //   zoom: 10.5,
    //   center: marker.getLngLat(),
    //   essential: true,
    //   easing: function (t) {
    //     return 1 - Math.pow(1 - t, 3);
    //   },
    //   duration: 1000,
    // });
  }

  let toggle = () => {
    if (timeout) stopFlying();
    else startFlying();
  };

  let toggleList = () => (showList = !showList);
  let showList;

  let currentPopup;
  function startFlying() {
    currentIndex++;

    for (let p in popups) popups[p].remove();
    if (currentIndex >= inview.length) currentIndex = 0;
    flyToMarker(inview[currentIndex]);

    timeout = setTimeout(startFlying, 4000);
  }

  function debounce(func, delay) {
    let timeout;
    let immediate = true;

    return function (...args) {
      const context = this;

      if (immediate) {
        func.apply(context, args);
        immediate = false;
      }

      clearTimeout(timeout);

      timeout = setTimeout(() => {
        immediate = true;
      }, delay);
    };
  }

  function stopFlying() {
    updateLabelVisibility();
    if (!timeout) return;
    timeout = clearTimeout(timeout);

    if (currentPopup) {
      currentPopup.remove();
    }

    map.jumpTo({ center: map.getCenter(), zoom: map.getZoom() });
    map.off("moveend");
  }

  let inview = [];

  let updateLabelVisibility = debounce(() => {
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
  }, 200);

  let locationMarkers = {};
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

            new Popup({
              target: popupContainer,
              props: { tags },
            });

            let marker = new maplibre.Marker({ color: "#F7931A", scale: 0.65 })
              .setLngLat([lon, lat])
              .setPopup(new maplibre.Popup().setDOMContent(popupContainer))
              .addTo(map);

            marker.id = counter++;

            marker.getElement().addEventListener("click", () => {
              let p = marker.getPopup();
              popups[marker.id] = p;
              p.setDOMContent(popupContainer);
              setTimeout(() => {
                selected = marker;
                setTimeout(scroll, 10);
              }, 50);
              p.on("close", () => {
                selected = undefined;
                delete popups[marker.id];
              });
            });

            marker.tags = tags;
            locationMarkers[location.id] = marker;

            markers.push(marker);
          });

          updateLabelVisibility();
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

<div class="w-screen h-screen flex" id="map" bind:this={mapWrapper}>
  <div
    id="map-container"
    class="mx-auto h-full w-full z-0"
    bind:this={mapContainer}
  />
  <div class="absolute flex top-2 left-2 gap-2">
    <button
      class="rounded-full border-2 border-black bg-white w-10 h-10"
      on:click={back}
    >
      <Icon icon="arrow-left" style="w-4 m-auto" />
    </button>
  </div>
  <div class="relative">
    {#if !showList}
      <div
        class="space-y-1 text-sm w-[300px] max-w-[calc(100vw*0.5)] h-[300px] max-h-[calc(100vh*0.4)] overflow-y-scroll p-4 bg-opacity-90 bg-primary absolute right-4 bottom-8 rounded-2xl shadow text-ellipsis"
      >
        <div class="relative mb-4 sticky top-0 bg-primary z-10">
          <input bind:value={search} class="w-full" />
          <div class="flex gap-1 absolute right-6 top-3">
            {#if search}
              <button on:click={clearSearch}>
                <Icon icon="close" style="w-8" />
              </button>
            {:else}
              <Icon icon="search" style="w-8" />
            {/if}
          </div>
        </div>

        {#each list as marker, i}
          <button
            on:click={() => select(marker)}
            class:font-bold={selected === marker}
            class:selected={selected === marker}
            class="block whitespace-nowrap text-ellipsis"
          >
            {marker.tags.name}
          </button>
        {/each}
      </div>
    {/if}
    <div class="absolute flex top-2 right-2 gap-2">
      <button
        class="rounded-full border-2 border-black bg-white w-10 h-10"
        on:click={toggleList}
      >
        <Icon icon="list" style="w-4 m-auto" />
      </button>
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
    </div>
  </div>
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
