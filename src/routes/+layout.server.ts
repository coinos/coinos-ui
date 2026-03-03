import { defaultLocale, loadTranslations, locales } from "$lib/translations/index";

export const load = async ({ cookies, request, url }) => {
  const { pathname } = url;

  // Try to get the locale from cookie
  let locale = (cookies.get("lang") || "").toLowerCase();

  // Get user preferred locale
  if (!locale) {
    locale = `${`${request.headers.get("accept-language")}`.match(
      /[a-zA-Z]+?(?=-|_|,|;)/,
    )}`.toLowerCase();
  }

  // Get defined locales
  const supportedLocales = locales.get().map((l) => l.toLowerCase());

  // Use default locale if current locale is not supported
  if (!supportedLocales.includes(locale)) {
    locale = defaultLocale;
  }

  await loadTranslations(locale, pathname); // keep this just before the `return`

  const theme = cookies.get("theme") || "light";

  return {
    theme,
    pathname,
    i18n: { locale, route: pathname },
  };
};
