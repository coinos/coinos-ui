import { get } from "$lib/utils";

export const load = async () => {
  let data = { locations: [] };

  try {
    data = await get("/locations");
  } catch {}

  return data;
};
