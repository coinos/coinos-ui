import { get } from "$lib/utils";
import { error } from "@sveltejs/kit";

export let load = async ({ params: { code } }) => {
  try {
    let user = await get(`/verify/${code}`);
    return { user };
  } catch (e) {
    console.log(e);
    return { error: "Verification failed" };
  }
};
