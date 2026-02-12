<script lang="ts">
  import { tick, onMount, onDestroy, mount } from "svelte";
  import { browser } from "$app/environment";
  import Popup from "$comp/Popup.svelte";
  import { back } from "$lib/utils";

  let { locations } = $props();
  let map: any;
  let mapContainer: any = $state(),
    mapWrapper: any = $state();
  let markers: any[] = [];
  let search: string = $state("");
  let clearSearch = (e: any) => (search = "");

  let currentIndex = -1;
  let timeout: any = $state();

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
      let doc = document as any;
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        /* Firefox */
        doc.mozCancelFullScreen();
      } else if (doc.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        /* IE/Edge */
        doc.msExitFullscreen();
      }
    }
  };

  let scroll = () => {
    const el = document.querySelector(".selected");
    if (el)
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
  };

  let selected = $state();
  function select(m: any) {
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
  let showList = $state();

  let currentPopup;
  function startFlying() {
    currentIndex++;

    for (let p in popups) popups[p].remove();
    if (currentIndex >= inview.length) currentIndex = 0;
    flyToMarker(inview[currentIndex]);

    timeout = setTimeout(startFlying, 4000);
  }

  function debounce(func: any, delay: any) {
    let timeout: any;
    let immediate = true;

    return function (this: any, ...args: any[]) {
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
    clearTimeout(timeout);
    timeout = undefined;

    if (currentPopup) {
      currentPopup.remove();
    }

    map.jumpTo({ center: map.getCenter(), zoom: map.getZoom() });
    map.off("moveend");
  }

  let inview: any[] = $state([]);

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

  let locationMarkers: any = {};
  let popups: any = {};
  let counter = 0;
  let maplibrePromise: any;

  const loadMaplibre = async () => {
    if ((window as any).maplibregl) return (window as any).maplibregl;
    if (maplibrePromise) return maplibrePromise;

    maplibrePromise = new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-maplibre]");
      if (existing) {
        if ((window as any).maplibregl) return resolve((window as any).maplibregl);
        existing.addEventListener("load", () => resolve((window as any).maplibregl));
        existing.addEventListener("error", reject);
        return;
      }

      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/maplibre-gl@5.7.1/dist/maplibre-gl.css";
      document.head.appendChild(css);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/maplibre-gl@5.7.1/dist/maplibre-gl.js";
      script.async = true;
      script.defer = true;
      script.dataset.maplibre = "true";
      script.onload = () => resolve((window as any).maplibregl);
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return maplibrePromise;
  };

  onMount(async () => {
    if (browser) {
      await tick();
      if (!mapContainer) return;
      loadMaplibre().then((maplibre) => {
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

            mount(Popup, {
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
  let list = $derived(
    search
      ? markers.filter((m) => m.tags.name.toLowerCase().includes(search.toLowerCase()))
      : inview,
  );
</script>

<div class="w-screen h-dvh flex" id="map" bind:this={mapWrapper}>
  <div id="map-container" class="mx-auto h-full w-full z-0" bind:this={mapContainer}></div>
  <div class="absolute flex top-2 left-2 gap-2">
    <button
      aria-label="Back"
      class="rounded-full border-2 border-black bg-base-100/80 w-16 h-16 flex items-center justify-center"
      onclick={back}
    >
      <iconify-icon noobserver icon="ph:arrow-left-bold" width="24"></iconify-icon>
    </button>
  </div>
  <div class="relative">
    {#if !showList}
      <div
        class="space-y-1 text-sm w-[300px] max-w-[calc(100vw*0.5)] h-[300px] max-h-[calc(100vh*0.4)] overflow-y-scroll p-4 bg-base-100/90 absolute right-4 bottom-8 rounded-2xl shadow text-ellipsis overflow-x-hidden"
      >
        <div class="relative mb-4 sticky top-0 bg-base-100 z-10">
          <input bind:value={search} class="w-full" />
          <div class="flex gap-1 absolute right-6 top-3">
            {#if search}
              <button type="button" onclick={clearSearch} aria-label="Clear">
                <iconify-icon noobserver icon="ph:x-bold" width="32"></iconify-icon>
              </button>
            {:else}
              <iconify-icon noobserver icon="ph:search-bold" width="32"></iconify-icon>
            {/if}
          </div>
        </div>

        {#each list as marker, i}
          <button
            onclick={() => select(marker)}
            class:font-bold={selected === marker}
            class:selected={selected === marker}
            class="block whitespace-nowrap text-ellipsis text-left w-full overflow-hidden"
          >
            {marker.tags.name}
          </button>
        {/each}
      </div>
    {/if}
    <div class="absolute flex top-2 right-2 gap-2">
      <button
        class="rounded-full border-2 border-primary bg-base-100/80 w-16 h-16 flex items-center justify-center"
        onclick={toggleList}
        aria-label="Toggle location list"
      >
        <iconify-icon noobserver icon="ph:list-bold" width="24"></iconify-icon>
      </button>
      <button
        class="rounded-full border-2 border-primary bg-base-100/80 w-16 h-16 flex items-center justify-center"
        onclick={toggle}
        aria-label={timeout ? "Resume map" : "Pause map"}
      >
        {#if timeout}
          <iconify-icon noobserver icon="ph:pause-bold" width="24"></iconify-icon>
        {:else}
          <iconify-icon noobserver icon="ph:play-bold" width="24"></iconify-icon>
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
