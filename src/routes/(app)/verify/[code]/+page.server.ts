import { get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export let load = async ({ params: { code } }) => {
  let user;
  try {
    user = await get(`/verify/${code}`);
  } catch (e) {
    console.log(e);
    return { error: "Verification failed" };
  }

  redirect(307, `/settings/account?verified=true`);
};
