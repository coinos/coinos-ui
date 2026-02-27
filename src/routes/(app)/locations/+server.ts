import { get } from "$lib/utils";
import { json } from "@sveltejs/kit";

export async function GET({ setHeaders, url }) {
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");
  const radius = url.searchParams.get("radius");
  const count = url.searchParams.get("count");

  let locations = [];

  try {
    if (lat && lon) {
      const params = new URLSearchParams({ lat, lon });
      if (radius) params.set("radius", radius);
      if (count) params.set("count", count);
      ({ locations } = await get(`/locations/nearby?${params}`));
    } else {
      ({ locations } = await get("/locations"));
    }
    setHeaders({ "cache-control": "public, max-age=600" });
  } catch {
    console.log("failed to fetch locations");
  }

  return json({ locations });
}
