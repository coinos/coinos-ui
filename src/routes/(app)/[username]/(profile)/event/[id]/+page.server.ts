import { get } from "$lib/utils";
import { error } from "@sveltejs/kit";

export async function load({ params: { id } }) {
  try {
    let event = await get(`/event/${id}`);
    if (!event) error(500, "Event not found");
    return { event };
  } catch (e: any) {
    error(500, e.message);
  }
}
