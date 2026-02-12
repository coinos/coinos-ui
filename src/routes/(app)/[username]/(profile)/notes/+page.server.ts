import { get } from "$lib/utils";
import { error } from "@sveltejs/kit";

export async function load({ parent }) {
  try {
    const { subject } = await parent();
    const events = await get(`/${subject.pubkey}/events`);
    return { events };
  } catch (e) {
    console.log(e);
    error(500, { message: "Failed to get events" });
  }
}
