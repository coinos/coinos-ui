import { auth, get } from "$lib/utils";
import { loadTranslations, locale } from "$lib/translations";

export let load = async ({ cookies, url }) => {
  let user;
  let token = cookies.get("token");
  if (token) {
    try {
      user = await get("/me", auth(cookies));
    } catch (e) {}
  }

  let { host, pathname } = url;
  let locale = user?.language || "en";
  await loadTranslations(locale, pathname);
  return { host, pathname };
};
