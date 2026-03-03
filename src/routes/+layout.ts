import { browser } from "$app/environment";
import { theme as themeStore } from "$lib/store";
import { addTranslations, setLocale, setRoute } from "$lib/translations/index";
import cookies from "js-cookie";

const expires = new Date();
expires.setSeconds(expires.getSeconds() + 21000000);
const opts = { path: "/", expires };

/** @type {import('@sveltejs/kit').Load} */
export const load = async ({ data }) => {
  const { i18n, translations } = data as any;
  const { locale, route } = i18n;

  addTranslations(translations);

  await setRoute(route);
  await setLocale(locale);

  if (browser) {
    let theme = cookies.get("theme");

    if (!theme) {
      theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

      cookies.set("theme", theme, opts);

      if (theme === "dark") setTimeout(() => themeStore.set(theme), 100);
    }
  }
};
