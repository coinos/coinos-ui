import { get } from "$lib/utils";
import { error } from "@sveltejs/kit";

export async function load({ params }) {
  try {
    const thread = await get(`/thread/${params.id}`);
    return { thread };
  } catch (e) {
    console.log(e);
    error(500, { message: "Failed to get thread" });
  }
}
