import { get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export const load = async ({ params: { code } }) => {
  try {
    await get(`/verify/${code}`);
  } catch (e) {
    console.log(e);
    return { error: "Verification failed" };
  }

  redirect(307, "/settings/account?verified=true");
};
