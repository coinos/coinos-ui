import { browser } from "$app/environment";
import { theme as themeStore } from "$lib/store";
import { addTranslations, setLocale, setRoute } from "$lib/translations/index";
import { getCookie, setCookie } from "$lib/utils";

/** @type {import('@sveltejs/kit').Load} */
export const load = async ({ data }) => {
  const { i18n, translations } = data as any;
  const { locale, route } = i18n;

  addTranslations(translations);

  await setRoute(route);
  await setLocale(locale);

  if (browser) {
    let theme = getCookie("theme");

    if (!theme) {
      theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

      setCookie("theme", theme, 21000000);

      if (theme === "dark") setTimeout(() => themeStore.set(theme), 100);
    }
  }
};
