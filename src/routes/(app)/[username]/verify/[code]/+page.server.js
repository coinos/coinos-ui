import { get } from "$lib/utils";
import { error, redirect } from "@sveltejs/kit";

export let load = async ({ params: { code } }) => {
  let user;
  try {
    user = await get(`/verify/${code}`);
  } catch (e) {
    console.log(e);
    return { error: "Verification failed" };
  }

  throw redirect(307, `/${user.username}/settings/account?verified=true`);
};
