import { get } from "$lib/utils";
import { error } from "@sveltejs/kit";

export let load = async ({ cookies, depends, params: { username } }) => {
  depends("app:user");

  try {
    let subject = await get(`/users/${username}`);

    let expires = new Date();
    expires.setSeconds(expires.getSeconds() + 380 * 24 * 60 * 60);
    cookies.set("username", username, { path: "/", expires });

    return { subject };
  } catch (e) {
    error(500, "Unable to retrieve user account data");
  }
};
