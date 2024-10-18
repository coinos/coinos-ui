import { get } from "$lib/utils";
import { error } from "@sveltejs/kit";

export let load = async ({
  cookies,
  depends,
  params: { username },
  parent,
}) => {
  depends("app:user");

  try {
    let subject = await get(`/users/${username}`);
    let { user } = await parent();

    let expires = new Date();
    expires.setSeconds(expires.getSeconds() + 380 * 24 * 60 * 60);
    cookies.set("username", username, { path: "/", expires });

    return { subject, user };
  } catch (e) {
    error(500, "Unable to retrieve user account data");
  }
};
