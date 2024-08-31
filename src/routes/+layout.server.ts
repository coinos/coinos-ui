import { auth, get } from "$lib/utils";
import {
  locales,
  loadTranslations,
  translations,
  defaultLocale,
} from "$lib/translations/index";

export let load = async ({ cookies, request, url }) => {
  let { host, pathname } = url;
  let user;
  let token = cookies.get("token");
  if (token) {
    try {
      user = await get("/me", auth(cookies));
    } catch (e) {}
  }

  // Try to get the locale from cookie
  let locale = user?.language || (cookies.get("lang") || "").toLowerCase();

  // Get user preferred locale
  if (!locale) {
    locale = `${`${request.headers.get("accept-language")}`.match(
      /[a-zA-Z]+?(?=-|_|,|;)/
    )}`.toLowerCase();
  }

  // Get defined locales
  let supportedLocales = locales.get().map((l) => l.toLowerCase());

  // Use default locale if current locale is not supported
  if (!supportedLocales.includes(locale)) {
    locale = defaultLocale;
  }

  await loadTranslations(locale, pathname); // keep this just before the `return`

  return {
    host,
    pathname,
    i18n: { locale, route: pathname },
    user,
    translations: translations.get(),
  };
};
