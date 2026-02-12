import {
  defaultLocale,
  loadTranslations,
  locales,
} from "$lib/translations/index";
import { auth, get, isInvalidTokenError, sleep } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export const load = async ({ cookies, request, url }) => {
  const { host, pathname } = url;
  let user;
  const token = cookies.get("token");
  if (token) {
    try {
      user = await get("/me", auth(cookies));
    } catch (e) {
      const { message } = e as Error;
      if (message.startsWith("Rate")) {
        await sleep(3000);
        try {
          user = await get("/me", auth(cookies));
        } catch (retryError) {
          if (isInvalidTokenError(retryError) && pathname !== "/logout") {
            redirect(307, "/logout");
          }
          throw retryError;
        }
      } else if (isInvalidTokenError(e) && pathname !== "/logout") {
        redirect(307, "/logout");
      } else {
        throw e;
      }
    }
  }

  // Try to get the locale from cookie
  let locale = user?.language || (cookies.get("lang") || "").toLowerCase();

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
    host,
    pathname,
    i18n: { locale, route: pathname },
    user,
  };
};
