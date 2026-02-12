import updateUser from "$lib/settings";
import { auth, get } from "$lib/utils";

export const load = async ({ cookies }) => {
  const { challenge } = await get("/challenge");
  const apps = await get("/apps", auth(cookies));
  return { apps, challenge };
};

export const actions = {
  default: updateUser,
};
