<script>
  import { tick, onMount, onDestroy, mount } from "svelte";
  import { browser } from "$app/environment";
  import Popup from "$comp/Popup.svelte";
  import { back } from "$lib/utils";
  import "maplibre-gl/dist/maplibre-gl.css";

  let { locations } = $props();
  let map;
  let mapContainer = $state(), mapWrapper = $state();
  let markers = [];
  let search = $state();
  let clearSearch = () => (search = "");
  let currentIndex = -1;
  let timeout = $state();

  let full = () => {
    if (!document.fullscreenElement) {
      if (mapWrapper.requestFullscreen) mapWrapper.requestFullscreen();
      else if (mapWrapper.mozRequestFullScreen) mapWrapper.mozRequestFullScreen();
      else if (mapWrapper.webkitRequestFullscreen) mapWrapper.webkitRequestFullscreen();
      else if (mapWrapper.msRequestFullscreen) mapWrapper.msRequestFullscreen();
      map.resize();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  };

  let scroll = () => {
    const el = document.querySelector(".selected");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  };

  let selected = $state();
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
      easing: t => 1 - Math.pow(1 - t, 3),
      duration,
    });
    await new Promise(r => setTimeout(r, duration));
    marker.getElement().click();
    updateLabelVisibility();
    await new Promise(r => setTimeout(r, 2500));
  }

  let toggle = () => { if (timeout) stopFlying(); else startFlying(); };
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

  function debounce(func, delay) {
    let timeout, immediate = true;
    return function (...args) {
      const context = this;
      if (immediate) { func.apply(context, args); immediate = false; }
      clearTimeout(timeout);
      timeout = setTimeout(() => { immediate = true; }, delay);
    };
  }

  function stopFlying() {
    updateLabelVisibility();
    if (!timeout) return;
    timeout = clearTimeout(timeout);
    if (currentPopup) currentPopup.remove();
    map.jumpTo({ center: map.getCenter(), zoom: map.getZoom() });
    map.off("moveend");
  }

  let inview = $state([]);
  let updateLabelVisibility = debounce(() => {
    inview = [];
    if (!map) return;
    let bounds = map.getBounds();
    for (let marker of markers) if (bounds.contains(marker.getLngLat())) inview.push(marker);
    inview.sort((a, b) => a.tags.name.localeCompare(b.tags.name));
  }, 200);

  let locationMarkers = {};
  let popups = {};
  let counter = 0;

  // ===== Export config (LANDSCAPE poster) =====
  const EXPORT = {};
  EXPORT.PREFIX  = "poster24x36";   // keep your existing name if your stitcher expects it
  EXPORT.BASE_Z  = 12;              // starting zoom to compute bump from
  EXPORT.TILE_W  = 1900;
  EXPORT.TILE_H  = 1900;
  EXPORT.OVERLAP = 100;             // total overlap per tile (px)
  EXPORT.STEP_W  = EXPORT.TILE_W - EXPORT.OVERLAP; // 1800
  EXPORT.STEP_H  = EXPORT.TILE_H - EXPORT.OVERLAP; // 1800
  // LANDSCAPE grid: wide x tall = 6 x 4
  EXPORT.COLS    = 6;               // -> total width  = 10800 px
  EXPORT.ROWS    = 4;               // -> total height =  7200 px

  // Your bounds (lon,lat)
  const BOUNDS = {
    nw: [-123.3179, 49.35712],
    se: [-122.5136, 49.0801],
  };

  // Wait until ALL tiles in view are loaded
  async function waitForTiles() {
    return new Promise((resolve) => {
      function check() {
        const style = map.style;
        if (!style) return;
        const allLoaded = Object.values(style.sourceCaches || {}).every((sc) => sc.loaded());
        if (allLoaded) resolve();
        else requestAnimationFrame(check);
      }
      check();
    });
  }

  // Helper: center of bounds
  function boundsCenter() {
    return [
      (BOUNDS.nw[0] + BOUNDS.se[0]) / 2,  // lon
      (BOUNDS.nw[1] + BOUNDS.se[1]) / 2   // lat
    ];
  }

  // *** MAIN EXPORT ***
  async function exportPoster() {
    // 0) Size the map canvas to match a single capture tile
    mapContainer.style.width  = EXPORT.TILE_W + "px";
    mapContainer.style.height = EXPORT.TILE_H + "px";
    map.resize();

    const [cx, cy] = boundsCenter();

    // 1) Put the map at BASE zoom & bounds center, THEN measure pixel span
    map.jumpTo({ center: [cx, cy], zoom: EXPORT.BASE_Z });
    await waitForTiles();

    const nwPx0 = map.project({ lng: BOUNDS.nw[0], lat: BOUNDS.nw[1] });
    const sePx0 = map.project({ lng: BOUNDS.se[0], lat: BOUNDS.se[1] });
    const spanW0 = sePx0.x - nwPx0.x;
    const spanH0 = sePx0.y - nwPx0.y;

    // 2) Work out how much to zoom so bounds >= target mosaic size (LANDSCAPE)
    const TARGET_W = EXPORT.COLS * EXPORT.STEP_W; // 10800
    const TARGET_H = EXPORT.ROWS * EXPORT.STEP_H; //  7200
    const scaleW   = TARGET_W / Math.max(1, spanW0);
    const scaleH   = TARGET_H / Math.max(1, spanH0);
    const zoomDelta = Math.log2(Math.max(scaleW, scaleH));
    const useZ = EXPORT.BASE_Z + zoomDelta;

    console.log(`Bounds pixel span at z${EXPORT.BASE_Z.toFixed(2)}: ${spanW0.toFixed(1)} × ${spanH0.toFixed(1)}`);
    console.log(`Need >= ${TARGET_W} × ${TARGET_H}; zoomΔ=${zoomDelta.toFixed(3)} ⇒ z=${useZ.toFixed(3)}`);

    // 3) Move map to the export zoom & re-measure NW corner in *current transform*
    map.jumpTo({ center: [cx, cy], zoom: useZ });
    await waitForTiles();

    const nwPx = map.project({ lng: BOUNDS.nw[0], lat: BOUNDS.nw[1] });

    // 4) Sweep the grid, anchoring to NW and stepping in WORLD PIXELS
    for (let r = 0; r < EXPORT.ROWS; r++) {
      for (let c = 0; c < EXPORT.COLS; c++) {
        const centerPixel = {
          x: nwPx.x + c * EXPORT.STEP_W + EXPORT.TILE_W / 2,
          y: nwPx.y + r * EXPORT.STEP_H + EXPORT.TILE_H / 2,
        };
        const centerLL = map.unproject(centerPixel);
        console.log(`Tile r${r} c${c} → lat=${centerLL.lat.toFixed(6)}, lon=${centerLL.lng.toFixed(6)}`);

        map.jumpTo({ center: centerLL, zoom: useZ });
        await waitForTiles();
        await new Promise(r => setTimeout(r, 40)); // small settle

        const dataURL = map.getCanvas().toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = `${EXPORT.PREFIX}_r${r}_c${c}.png`;
        a.click();

        await new Promise(r => setTimeout(r, 30));
      }
    }

    // Optional sanity: where did the final SE land?
    const finalSEpx = {
      x: nwPx.x + (EXPORT.COLS - 1) * EXPORT.STEP_W + EXPORT.TILE_W,
      y: nwPx.y + (EXPORT.ROWS - 1) * EXPORT.STEP_H + EXPORT.TILE_H
    };
    const finalSELL = map.unproject(finalSEpx);
    console.log(`Final SE approx lat=${finalSELL.lat.toFixed(6)}, lon=${finalSELL.lng.toFixed(6)} (expected ~ White Rock)`);
  }

  onMount(() => {
    if (browser) {
      import("maplibre-gl").then(({ default: maplibre }) => {
        map = new maplibre.Map({
          preserveDrawingBuffer: true,
          container: mapContainer,
          style: "https://tiles.stadiamaps.com/styles/stamen_toner.json",
          center: [-123.05, 49.26],
          zoom: 10.5,
        });

        map.on("load", () => {
          // (Interactive DOM markers remain; export will still work since we rasterize the map canvas)
          locations.forEach((location) => {
            if (location["deleted_at"]) return;
            let { lat, lon, tags } = location["osm_json"];
            if (!(lat && lon)) return;
            let popupContainer = document.createElement("div");
            mount(Popup, { target: popupContainer, props: { tags } });
            let marker = new maplibre.Marker({ color: "#F7931A", scale: 0.65 })
              .setLngLat([lon, lat])
              .setPopup(new maplibre.Popup().setDOMContent(popupContainer))
              .addTo(map);
            marker.id = counter++;
            marker.getElement().addEventListener("click", () => {
              let p = marker.getPopup();
              popups[marker.id] = p;
              p.setDOMContent(popupContainer);
              setTimeout(() => { selected = marker; setTimeout(scroll, 10); }, 50);
              p.on("close", () => { selected = undefined; delete popups[marker.id]; });
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
        document.addEventListener("fullscreenchange",  resize, false);
        document.addEventListener("webkitfullscreenchange", resize, false);
        document.addEventListener("mozfullscreenchange",    resize, false);
        document.addEventListener("MSFullscreenChange",     resize, false);
      });
    }
  });

  onDestroy(() => map && map.remove());
  let list = $derived(
    search
      ? markers.filter(m => m.tags.name.toLowerCase().includes(search.toLowerCase()))
      : inview
  );
</script>

<div class="w-screen h-dvh flex" id="map" bind:this={mapWrapper}>
  <div id="map-container" class="mx-auto h-full w-full z-0" bind:this={mapContainer}></div>
  <div class="absolute flex top-2 left-2 gap-2">
    <button aria-label="Back" class="rounded-full border-2 border-black bg-base-100 w-16 h-16 flex items-center justify-center bg-opacity-80" onclick={back}>
      <iconify-icon noobserver icon="ph:arrow-left-bold" width="24"></iconify-icon>
    </button>
  </div>
  <div class="relative">
    {#if !showList}
      <div class="space-y-1 text-sm w-[300px] max-w-[calc(100vw*0.5)] h-[300px] max-h-[calc(100vh*0.4)] overflow-y-scroll p-4 bg-opacity-90 bg-base-100 absolute right-4 bottom-8 rounded-2xl shadow text-ellipsis overflow-x-hidden">
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
        {#each list as marker}
          <button onclick={() => select(marker)} class:font-bold={selected === marker} class:selected={selected === marker} class="block whitespace-nowrap text-ellipsis text-left w-full overflow-hidden">
            {marker.tags.name}
          </button>
        {/each}
      </div>
    {/if}
    <div class="absolute flex top-2 right-2 gap-2">
      <button class="rounded-full border-2 border-primary bg-base-100 w-16 h-16 flex items-center justify-center bg-opacity-80" onclick={toggleList}>
        <iconify-icon noobserver icon="ph:list-bold" width="24"></iconify-icon>
      </button>
      <button class="rounded-full border-2 border-primary bg-base-100 w-16 h-16 flex items-center justify-center bg-opacity-80" onclick={toggle}>
        {#if timeout}
          <iconify-icon noobserver icon="ph:pause-bold" width="24"></iconify-icon>
        {:else}
          <iconify-icon noobserver icon="ph:play-bold" width="24"></iconify-icon>
        {/if}
      </button>
      <button class="btn btn-primary" onclick={exportPoster}>
        Export 36×24 @300DPI
      </button>
    </div>
  </div>
</div>

<style>
  #map:fullscreen, #map-container:fullscreen { width: 100% !important; height: 100% !important; }
  :global(.maplibregl-popup-close-button) { font-size: 24px; padding: 8px; }
  :global(.maplibregl-popup :focus) { outline: none; }
  :global(.maplibregl-ctrl-attrib) { display: none; }
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
