<script lang="ts">
  import { tick, onMount, onDestroy, mount } from "svelte";
  import { browser } from "$app/environment";
  import Popup from "$comp/Popup.svelte";
  import { back } from "$lib/utils";
  import { t } from "$lib/translations";

  let map: any;
  let maplibreRef: any;
  let mapReady = $state(false);
  let mapContainer: any = $state(),
    mapWrapper: any = $state();
  let markers: any[] = $state([]);
  let search: string = $state("");
  let clearSearch = (e: any) => (search = "");


  let full = () => {
    if (!document.fullscreenElement) {
      if (mapWrapper.requestFullscreen) {
        mapWrapper.requestFullscreen();
      } else if (mapWrapper.mozRequestFullScreen) {
        mapWrapper.mozRequestFullScreen();
      } else if (mapWrapper.webkitRequestFullscreen) {
        mapWrapper.webkitRequestFullscreen();
      } else if (mapWrapper.msRequestFullscreen) {
        mapWrapper.msRequestFullscreen();
      }

      map.resize();
    } else {
      let doc = document as any;
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
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
    if (m.category && !activeFilters.has(m.category)) {
      activeFilters.add(m.category);
      activeFilters = new Set(activeFilters);
    }
    map.flyTo({
      zoom: 12,
      center: m.getLngLat(),
      essential: true,
      duration: 500,
    });
    setTimeout(() => {
      m.getElement().style.display = "";
      m.getElement().click();
      updateLabelVisibility();
    }, 500);
  }

  let toggleList = () => {
    showList = !showList;
    showFilters = false;
    if (showList) scrollToFirstActive();
  };

  function scrollToCategory(el: Element | null) {
    if (el) el.scrollIntoView({ block: "start" });
  }

  function scrollToFirstActive() {
    tick().then(() => {
      let target = lastToggledOn && activeFilters.has(lastToggledOn) ? lastToggledOn : activeFilters.values().next().value;
      if (!target) return;
      scrollToCategory(document.querySelector(`[data-category="${target}"]`));
    });
  }
  let showList = $state(true);

  let showFilters = $state(false);
  let filtersUsed = false;
  let toggleFilters = () => {
    if (!showFilters && !filtersUsed) {
      clearAllFilters();
      filtersUsed = true;
    }
    showFilters = !showFilters;
    if (showFilters) showList = false;
  };

  const categoryLabels: { slug: string; name: string }[] = [
    { slug: "restaurant", name: "Restaurant" },
    { slug: "cafe", name: "Café" },
    { slug: "bar", name: "Bar" },
    { slug: "fast-food", name: "Fast Food" },
    { slug: "grocery", name: "Grocery" },
    { slug: "hairdresser", name: "Hairdresser" },
    { slug: "hotel", name: "Hotel" },
    { slug: "shop", name: "Shop" },
    { slug: "atm", name: "ATM" },
    { slug: "health", name: "Health" },
    { slug: "office", name: "Office" },
    { slug: "default", name: "Other" },
  ];

  let activeFilters: Set<string> = $state(new Set(categoryLabels.map((c) => c.slug)));

  let lastToggledOn: string | undefined = $state();

  function toggleCategory(slug: string) {
    let turningOn = !activeFilters.has(slug);
    if (turningOn) {
      activeFilters.add(slug);
      lastToggledOn = slug;
    } else {
      activeFilters.delete(slug);
      if (lastToggledOn === slug) lastToggledOn = undefined;
    }
    activeFilters = new Set(activeFilters);
    if (turningOn) {
      tick().then(() => {
        let el = document.querySelector(`[data-category="${slug}"]`);
        if (!el) el = document.querySelector(`[data-category]`);
        scrollToCategory(el);
      });
    }
  }

  function setAllFilters() {
    activeFilters = new Set(categoryLabels.map((c) => c.slug));
  }

  function clearAllFilters() {
    activeFilters = new Set();
  }

  function soloCategory(slug: string) {
    activeFilters = new Set([slug]);
  }

  $effect(() => {
    for (let marker of markers) {
      if (!marker.category) continue;
      let popup = marker.getPopup();
      if (!activeFilters.has(marker.category) && popup.isOpen()) popup.remove();
    }
    updateClusterSource();
  });

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

  let inview: any[] = $state([]);

  function syncMarkerVisibility() {
    inview = [];
    if (!map) return;
    let bounds = map.getBounds();

    let unclusteredIds = new Set<number>();
    if (map.getLayer("unclustered-point")) {
      try {
        let features = map.queryRenderedFeatures(undefined, {
          layers: ["unclustered-point"],
        });
        for (let f of features) {
          if (f.properties?.id != null) unclusteredIds.add(f.properties.id);
        }
      } catch (_) {}
    }

    let hasClusters = unclusteredIds.size > 0 || map.getSource("locations-source");

    for (let marker of markers) {
      let isInView = bounds.contains(marker.getLngLat());
      let passesFilter = !marker.category || activeFilters.has(marker.category);

      if (hasClusters && map.getLayer("unclustered-point")) {
        let isUnclustered = unclusteredIds.has(marker.id);
        let isSelected = selected === marker;
        marker.getElement().style.display = passesFilter && (isUnclustered || isSelected) ? "" : "none";
      } else {
        marker.getElement().style.display = passesFilter ? "" : "none";
      }

      if (isInView) inview.push(marker);
    }

    inview = inview.sort((a, b) => a.tags.name.localeCompare(b.tags.name));
  }

  let updateLabelVisibility = debounce(syncMarkerVisibility, 200);

  function getCategory(tags: any): string {
    if (!tags) return "default";
    let a = tags.amenity;
    let s = tags.shop;
    let t = tags.tourism;
    let o = tags.office;

    if (a === "restaurant") return "restaurant";
    if (a === "cafe") return "cafe";
    if (a === "bar" || a === "pub") return "bar";
    if (a === "fast_food") return "fast-food";
    if (a === "atm" || a === "bureau_de_change") return "atm";
    if (a === "pharmacy" || a === "doctors" || a === "dentist" || a === "hospital" || a === "clinic") return "health";
    if (a === "hairdresser") return "hairdresser";
    if (s === "supermarket" || s === "convenience" || s === "grocery" || s === "greengrocer") return "grocery";
    if (s === "hairdresser" || s === "barber") return "hairdresser";
    if (s) return "shop";
    if (t === "hotel" || t === "guest_house" || t === "hostel" || t === "motel") return "hotel";
    if (o) return "office";
    return "default";
  }

  const categoryIcons: Record<string, string> = {
    restaurant: `<path fill="white" d="M68 88V40a12 12 0 0 1 24 0v48a12 12 0 0 1-24 0m152-48v184a12 12 0 0 1-24 0v-44h-44a12 12 0 0 1-12-12a273.2 273.2 0 0 1 7.33-57.82c10.09-41.76 29.43-69.85 55.94-81.18A12 12 0 0 1 220 40m-24 22.92C182.6 77 175 98 170.77 115.38a254.4 254.4 0 0 0-6.22 40.62H196ZM128 39a12 12 0 0 0-24 2l4 47.46a28 28 0 0 1-56 0L56 41a12 12 0 1 0-24-2l-4 48v1a52.1 52.1 0 0 0 40 50.59V224a12 12 0 0 0 24 0v-85.41A52.1 52.1 0 0 0 132 88v-1Z"/>`,
    cafe: `<path fill="white" d="M212 76H32a12 12 0 0 0-12 12v48a100.24 100.24 0 0 0 26.73 68H32a12 12 0 0 0 0 24h176a12 12 0 0 0 0-24h-14.73a100.8 100.8 0 0 0 20-32A44 44 0 0 0 256 128v-8a44.05 44.05 0 0 0-44-44m-16 60a76.27 76.27 0 0 1-42 68H86a76.27 76.27 0 0 1-42-68v-36h152Zm36-8a20 20 0 0 1-12.57 18.55A97 97 0 0 0 220 136v-34.32A20 20 0 0 1 232 120ZM68 48V24a12 12 0 0 1 24 0v24a12 12 0 0 1-24 0m40 0V24a12 12 0 0 1 24 0v24a12 12 0 0 1-24 0m40 0V24a12 12 0 0 1 24 0v24a12 12 0 0 1-24 0"/>`,
    bar: `<path fill="white" d="m248.49 39.51l-32-32a12 12 0 0 0-18.55 15L147 60.77l-37.33 7.46a12.1 12.1 0 0 0-6.14 3.28L20.2 154.83a28 28 0 0 0 0 39.6l41.37 41.37a28 28 0 0 0 39.6 0l83.32-83.31a12.1 12.1 0 0 0 3.28-6.14l7.46-37.35l38.23-51a12 12 0 0 0 15-18.55ZM112 191l-47-47l31-31l47 47Zm-30.63 29a4 4 0 0 1-2.83-1.17l-41.37-41.37a4 4 0 0 1 0-5.66L48 161l47 47l-10.8 10.83a4 4 0 0 1-2.83 1.17m93-123.2a12 12 0 0 0-2.17 4.85l-7.2 36.43l-5 4.92l-47-47l5-5l36.43-7.28a12 12 0 0 0 4.85-2.17l55.67-41.76l1.29 1.29Z"/>`,
    "fast-food": `<path fill="white" d="m227.9 152.72l-39.7 14.44l-35.74-14.3a12 12 0 0 0-8.92 0L108 167.08l-35.54-14.22a12 12 0 0 0-8.56-.14l-44 16a12 12 0 0 0 8.2 22.56l8.12-2.95A44.06 44.06 0 0 0 80 228h96a44.05 44.05 0 0 0 44-44v-2.87l16.1-5.85a12 12 0 0 0-8.2-22.56M176 204H80a20 20 0 0 1-20-20v-4.32l7.8-2.84l35.74 14.3a12 12 0 0 0 8.92 0L148 176.92l35.54 14.22a12 12 0 0 0 8.56.14l2.89-1.06A20 20 0 0 1 176 204M12 128a12 12 0 0 1 12-12h208a12 12 0 0 1 0 24H24a12 12 0 0 1-12-12m36.2-24h159.6a20.36 20.36 0 0 0 16.38-8.29a19.59 19.59 0 0 0 2.88-17.65C216.12 43.88 175.39 20 128 20S39.89 43.87 28.94 78.05a19.56 19.56 0 0 0 2.88 17.65A20.32 20.32 0 0 0 48.2 104M128 44c33.7 0 63.61 14.85 74 36H54c10.4-21.15 40.31-36 74-36"/>`,
    grocery: `<path fill="white" d="M233.21 56.31A12 12 0 0 0 224 52H66l-5.47-30.15A12 12 0 0 0 48.73 12H24a12 12 0 0 0 0 24h14.71l24.91 137a28 28 0 0 0 4.07 10.21A32 32 0 1 0 123 196h34a32 32 0 1 0 31-24H91.17a4 4 0 0 1-3.93-3.28L84.92 156H196.1a28 28 0 0 0 27.55-23l12.16-66.86a12 12 0 0 0-2.6-9.83M100 204a8 8 0 1 1-8-8a8 8 0 0 1 8 8m88 8a8 8 0 1 1 8-8a8 8 0 0 1-8 8m12-83.28a4 4 0 0 1-3.9 3.28H80.56L70.38 76h139.24Z"/>`,
    hairdresser: `<path fill="white" d="M238.78 183.79L98.28 87.65A40.2 40.2 0 0 0 100 76a40 40 0 1 0-15.29 31.45l30 20.56l-30 20.56a40 40 0 1 0 3.57 59.74A39.73 39.73 0 0 0 100 180a40.2 40.2 0 0 0-1.72-11.66l37.72-25.8l89.22 61.06a12 12 0 0 0 13.56-19.81m-167.47 7.54A16 16 0 1 1 76 180a16 16 0 0 1-4.69 11.33M48.69 87.3a16 16 0 1 1 22.62 0a16 16 0 0 1-22.62 0m112.82 23.24a12 12 0 0 1 3.13-16.68l60.58-41.46a12 12 0 0 1 13.56 19.81l-60.59 41.46a12 12 0 0 1-16.68-3.13"/>`,
    hotel: `<path fill="white" d="M212 68H36V48a12 12 0 0 0-24 0v160a12 12 0 0 0 24 0v-28h196v28a12 12 0 0 0 24 0v-96a44.05 44.05 0 0 0-44-44m-112 88H36V92h64Zm132 0H124V92h88a20 20 0 0 1 20 20Z"/>`,
    shop: `<path fill="white" d="M236 96a12 12 0 0 0-.44-3.3L221.2 42.51A20.08 20.08 0 0 0 202 28H54a20.08 20.08 0 0 0-19.2 14.51L20.46 92.7A12 12 0 0 0 20 96v16a43.94 43.94 0 0 0 16 33.92V216a12 12 0 0 0 12 12h160a12 12 0 0 0 12-12v-70.08A43.94 43.94 0 0 0 236 112zM57.05 52H199l9.14 32H47.91Zm91 56v4a20 20 0 0 1-40 0v-4ZM53 128.71A20 20 0 0 1 44 112v-4h40v4a20 20 0 0 1-20 20a19.76 19.76 0 0 1-9.07-2.2a11.5 11.5 0 0 0-1.93-1.09M196 204H60v-48.19c1.32.12 2.65.19 4 .19a43.86 43.86 0 0 0 32-13.85a43.89 43.89 0 0 0 64 0A43.86 43.86 0 0 0 192 156c1.35 0 2.68-.07 4-.19Zm16-92a20 20 0 0 1-9 16.71a11.7 11.7 0 0 0-1.88 1.09A20 20 0 0 1 172 112v-4h40Z"/>`,
    atm: `<path fill="white" d="M152 116h-12V60h4a28 28 0 0 1 28 28a12 12 0 0 0 24 0a52.06 52.06 0 0 0-52-52h-4V24a12 12 0 0 0-24 0v12h-4a52 52 0 0 0 0 104h4v56h-12a28 28 0 0 1-28-28a12 12 0 0 0-24 0a52.06 52.06 0 0 0 52 52h12v12a12 12 0 0 0 24 0v-12h12a52 52 0 0 0 0-104m-40 0a28 28 0 0 1 0-56h4v56Zm40 80h-12v-56h12a28 28 0 0 1 0 56"/>`,
    health: `<path fill="white" d="M216 52h-36v-8a28 28 0 0 0-28-28h-48a28 28 0 0 0-28 28v8H40a20 20 0 0 0-20 20v128a20 20 0 0 0 20 20h176a20 20 0 0 0 20-20V72a20 20 0 0 0-20-20m-116-8a4 4 0 0 1 4-4h48a4 4 0 0 1 4 4v8h-56Zm112 152H44V76h168Zm-48-60a12 12 0 0 1-12 12h-12v12a12 12 0 0 1-24 0v-12h-12a12 12 0 0 1 0-24h12v-12a12 12 0 0 1 24 0v12h12a12 12 0 0 1 12 12"/>`,
    office: `<path fill="white" d="M240 204h-12V96a20 20 0 0 0-20-20h-36V32a20 20 0 0 0-28.45-18.12l-104 48.54A20.06 20.06 0 0 0 28 80.55V204H16a12 12 0 0 0 0 24h224a12 12 0 0 0 0-24m-36-104v104h-32V100ZM52 83.09l96-44.79V204H52ZM132 112v12a12 12 0 0 1-24 0v-12a12 12 0 0 1 24 0m-40 0v12a12 12 0 0 1-24 0v-12a12 12 0 0 1 24 0m0 52v12a12 12 0 0 1-24 0v-12a12 12 0 0 1 24 0m40 0v12a12 12 0 0 1-24 0v-12a12 12 0 0 1 24 0"/>`,
    default: `<path fill="white" d="M128 16a88.1 88.1 0 0 0-88 88c0 75.3 80 132.17 83.41 134.55a12 12 0 0 0 9.18 0C136 236.17 216 179.3 216 104a88.1 88.1 0 0 0-88-88m0 56a32 32 0 1 1-32 32a32 32 0 0 1 32-32"/>`,
  };

  function createCategoryMarker(tags: any): HTMLElement {
    let cat = getCategory(tags);
    let icon = categoryIcons[cat] || categoryIcons.default;

    let el = document.createElement("div");
    el.style.cursor = "pointer";
    el.style.display = "none";
    el.style.width = "36px";
    el.style.height = "46px";
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 28 36">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z" fill="#F7931A"/>
      <svg x="4" y="2.5" width="20" height="20" viewBox="0 0 256 256">${icon}</svg>
    </svg>`;
    return el;
  }

  let locationMarkers: any = {};
  let addedIds = new Set();
  let popups: any = {};
  let counter = 0;
  let maplibrePromise: any;

  function addMarkers(locations: any[]) {
    let maplibre = maplibreRef;
    if (!map || !maplibre) return;

    locations.forEach((location) => {
      if (location["deleted_at"]) return;
      if (addedIds.has(location.id)) return;
      addedIds.add(location.id);

      let { lat, lon, tags } = location["osm_json"];
      if (!(lat && lon)) return;

      let popupContainer = document.createElement("div");

      mount(Popup, {
        target: popupContainer,
        props: { tags },
      });

      let marker = new maplibre.Marker({ element: createCategoryMarker(tags) })
        .setLngLat([lon, lat])
        .setPopup(new maplibre.Popup({ offset: [0, -46] }).setDOMContent(popupContainer))
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
      marker.category = getCategory(tags);
      locationMarkers[location.id] = marker;

      markers.push(marker);
    });

    updateLabelVisibility();
    updateClusterSource();
  }

  function updateClusterSource() {
    if (!map || !map.getSource("locations-source")) return;
    let features = markers
      .filter((m) => !m.category || activeFilters.has(m.category))
      .map((m) => {
        let lngLat = m.getLngLat();
        return {
          type: "Feature" as const,
          properties: { id: m.id },
          geometry: {
            type: "Point" as const,
            coordinates: [lngLat.lng, lngLat.lat],
          },
        };
      });
    (map.getSource("locations-source") as any).setData({
      type: "FeatureCollection",
      features,
    });
    map.once("idle", syncMarkerVisibility);
  }

  let fetchController: AbortController | null = null;

  async function fetchNearby(lat: number, lon: number, radius: number) {
    if (fetchController) fetchController.abort();
    fetchController = new AbortController();

    try {
      let params = new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
        radius: String(Math.ceil(radius)),
        count: "500",
      });
      let res = await fetch(`/locations?${params}`, { signal: fetchController.signal });
      let data = await res.json();
      if (data.locations) addMarkers(data.locations);
    } catch (e: any) {
      if (e.name !== "AbortError") console.log("fetch nearby failed", e);
    }
  }

  function getViewportRadius() {
    let bounds = map.getBounds();
    let center = map.getCenter();
    let ne = bounds.getNorthEast();

    let dlat = ne.lat - center.lat;
    let dlng = ne.lng - center.lng;
    let km = Math.sqrt(dlat * dlat + dlng * dlng) * 111;
    return Math.max(km, 10);
  }

  let fetchOnMove = debounce(() => {
    if (!map) return;
    let center = map.getCenter();
    fetchNearby(center.lat, center.lng, getViewportRadius());
  }, 500);

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

  function getStartPosition(): Promise<{ center: [number, number]; zoom: number }> {
    let fallback = { center: [-123.05, 49.26] as [number, number], zoom: 10.5 };
    if (!navigator.geolocation) return Promise.resolve(fallback);
    return new Promise((resolve) => {
      let timer = setTimeout(() => resolve(fallback), 2000);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timer);
          resolve({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 11 });
        },
        () => {
          clearTimeout(timer);
          resolve(fallback);
        },
        { timeout: 2000 },
      );
    });
  }

  onMount(async () => {
    if (browser) {
      await tick();
      if (!mapContainer) return;
      let [maplibre, start] = await Promise.all([loadMaplibre(), getStartPosition()]);
      maplibreRef = maplibre;

      map = new maplibre.Map({
        container: mapContainer,
        style: "https://tiles.stadiamaps.com/styles/stamen_toner.json",
        center: start.center,
        zoom: start.zoom,
      });

      map.scrollZoom.setWheelZoomRate(1 / 60);
      map.scrollZoom.setZoomRate(1 / 30);

      map.on("load", () => {
          mapReady = true;

          map.addSource("locations-source", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
            cluster: true,
            clusterRadius: 50,
            clusterMaxZoom: 14,
          });

          map.addLayer({
            id: "clusters",
            type: "circle",
            source: "locations-source",
            filter: ["has", "point_count"],
            paint: {
              "circle-color": "#F7931A",
              "circle-radius": [
                "step",
                ["get", "point_count"],
                18,
                10,
                22,
                50,
                28,
                100,
                34,
              ],
              "circle-stroke-width": 2,
              "circle-stroke-color": "#fff",
            },
          });

          map.addLayer({
            id: "cluster-count",
            type: "symbol",
            source: "locations-source",
            filter: ["has", "point_count"],
            layout: {
              "text-field": ["get", "point_count_abbreviated"],
              "text-size": 14,
            },
            paint: {
              "text-color": "#ffffff",
            },
          });

          map.addLayer({
            id: "unclustered-point",
            type: "circle",
            source: "locations-source",
            filter: ["!", ["has", "point_count"]],
            paint: {
              "circle-radius": 1,
              "circle-opacity": 0,
            },
          });

          map.on("click", "clusters", (e: any) => {
            let features = map.queryRenderedFeatures(e.point, {
              layers: ["clusters"],
            });
            if (!features.length) return;
            map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: 15,
            });
          });

          map.on("mouseenter", "clusters", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "clusters", () => {
            map.getCanvas().style.cursor = "";
          });

          map.on("moveend", () => updateLabelVisibility());

          // Initial fetch for starting position
        fetchNearby(start.center[1], start.center[0], 500);

        // Fetch more on pan/zoom
        map.on("moveend", fetchOnMove);
      });

      let resize = () => map && map.resize();

      document.addEventListener("fullscreenchange", resize, false);
      document.addEventListener("webkitfullscreenchange", resize, false);
      document.addEventListener("mozfullscreenchange", resize, false);
      document.addEventListener("MSFullscreenChange", resize, false);
    }
  });

  onDestroy(() => map && map.remove());
  let list = $derived(
    search
      ? markers.filter(
          (m) =>
            m.tags.name.toLowerCase().includes(search.toLowerCase()) &&
            (!m.category || activeFilters.has(m.category)),
        )
      : inview,
  );

  let categoryLabelMap = Object.fromEntries(categoryLabels.map((c) => [c.slug, c.name]));

  let presentCategories = $derived(
    categoryLabels.filter((c) => inview.some((m) => m.category === c.slug)),
  );

  let allList = $derived(
    search
      ? markers.filter((m) => m.tags.name.toLowerCase().includes(search.toLowerCase()))
      : inview,
  );

  let groupedList = $derived.by(() => {
    let groups: { slug: string; name: string; markers: any[] }[] = [];
    let map = new Map<string, any[]>();
    for (let m of allList) {
      let cat = m.category || "default";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(m);
    }
    for (let [slug, items] of map) {
      groups.push({ slug, name: categoryLabelMap[slug] || slug, markers: items });
    }
    groups.sort((a, b) => a.name.localeCompare(b.name));
    return groups;
  });
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
    {#if showList}
      <div class="flex flex-col w-[300px] max-w-[calc(100vw*0.5)] absolute right-4 bottom-8 bg-base-100/90 rounded-2xl shadow overflow-hidden">
        <div class="flex items-center gap-2 p-3">
          <div class="relative flex-1">
            <input bind:value={search} placeholder="Search locations..." class="w-full border border-base-300 rounded-lg pl-3 pr-8 py-2 text-sm" />
            <div class="flex items-center absolute right-2 top-1/2 -translate-y-1/2">
              {#if search}
                <button type="button" onclick={clearSearch} aria-label="Clear">
                  <iconify-icon noobserver icon="ph:x-bold" width="20"></iconify-icon>
                </button>
              {:else}
                <iconify-icon noobserver icon="ph:magnifying-glass-bold" width="20" class="opacity-40"></iconify-icon>
              {/if}
            </div>
          </div>
          <button onclick={() => showList = false} aria-label="Close" class="opacity-40 hover:opacity-100">
            <iconify-icon noobserver icon="ph:x-bold" width="18"></iconify-icon>
          </button>
        </div>
        <div class="space-y-1 text-sm h-[250px] max-h-[calc(100vh*0.35)] overflow-y-scroll px-4 pb-4 text-ellipsis overflow-x-hidden">
        {#each groupedList as group}
          {@const active = activeFilters.has(group.slug)}
          <button
            onclick={() => toggleCategory(group.slug)}
            data-category={group.slug}
            class="flex items-center gap-1.5 w-full pt-3 pb-1 font-bold text-xs uppercase tracking-wide hover:opacity-100 transition-opacity"
            class:opacity-30={!active}
            class:opacity-70={active}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="18" viewBox="0 0 28 36">
              <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z" fill={active ? "#F7931A" : "#ccc"}/>
              <svg x="4" y="2.5" width="20" height="20" viewBox="0 0 256 256">{@html categoryIcons[group.slug]}</svg>
            </svg>
            {group.name}
            <span class="font-normal">({group.markers.length})</span>
          </button>
          {#each group.markers as marker}
            <button
              onclick={() => select(marker)}
              class:font-bold={selected === marker}
              class:selected={selected === marker}
              class="block whitespace-nowrap text-ellipsis text-left w-full overflow-hidden pl-5 transition-opacity"
              class:opacity-30={!active}
            >
              {marker.tags.name}
            </button>
          {/each}
        {/each}
        </div>
      </div>
    {/if}
    {#if showFilters}
      <div
        class="w-[300px] max-w-[calc(100vw*0.5)] max-h-[calc(100vh*0.4)] overflow-y-auto p-4 bg-base-100/90 absolute right-4 bottom-8 rounded-2xl shadow"
      >
        <div class="flex gap-2 mb-3">
          <button
            onclick={setAllFilters}
            class="text-xs px-3 py-1 rounded-full border border-primary bg-primary text-white"
          >All</button>
          <button
            onclick={clearAllFilters}
            class="text-xs px-3 py-1 rounded-full border border-primary"
          >None</button>
          <button onclick={() => showFilters = false} aria-label="Close" class="ml-auto opacity-40 hover:opacity-100">
            <iconify-icon noobserver icon="ph:x-bold" width="18"></iconify-icon>
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          {#each presentCategories as cat}
            <button
              onclick={() => toggleCategory(cat.slug)}
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs border transition-colors"
              class:bg-primary={activeFilters.has(cat.slug)}
              class:text-white={activeFilters.has(cat.slug)}
              class:border-primary={activeFilters.has(cat.slug)}
              class:border-base-300={!activeFilters.has(cat.slug)}
              class:opacity-50={!activeFilters.has(cat.slug)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 28 36">
                <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z" fill="#F7931A"/>
                <svg x="4" y="2.5" width="20" height="20" viewBox="0 0 256 256">{@html categoryIcons[cat.slug]}</svg>
              </svg>
              {cat.name}
            </button>
          {/each}
        </div>
      </div>
    {/if}
    <div class="absolute flex flex-col top-2 right-2 gap-2">
      <div class="flex gap-2">
        <button
          class="rounded-full border-2 border-primary w-16 h-16 flex items-center justify-center {showFilters ? 'bg-primary text-white' : 'bg-base-100/80'}"
          onclick={toggleFilters}
          aria-label="Filter categories"
        >
          <iconify-icon noobserver icon="ph:funnel-bold" width="24"></iconify-icon>
        </button>
        <button
          class="rounded-full border-2 border-primary w-16 h-16 flex items-center justify-center {showList ? 'bg-primary text-white' : 'bg-base-100/80'}"
          onclick={toggleList}
          aria-label="Toggle location list"
        >
          <iconify-icon noobserver icon="ph:list-bold" width="24"></iconify-icon>
        </button>
      </div>
      <a href="/map/add" class="whitespace-nowrap rounded-full bg-black text-white h-12 flex items-center justify-center gap-2 px-6 text-sm font-semibold hover:opacity-80 transition-opacity">
        <iconify-icon noobserver icon="ph:plus-bold" width="20"></iconify-icon>
        {$t("mapAdd.addLocation")}
      </a>
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
