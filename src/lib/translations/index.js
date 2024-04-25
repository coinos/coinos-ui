import i18n from "sveltekit-i18n";
import lang from "./lang.json";

// setup loaders & translations from lang.json data
function createLocaleLoader(localeCode) {
  return {
    locale: localeCode,
    key: "",
    loader: async () =>
      (await import(`../../locales/${localeCode}.json`)).default,
  };
}

const availableLocales = Object.keys(lang);
const trans = {};
for (let i = 0; i < availableLocales.length; i++) {
  trans[availableLocales[i]] = { lang };
}
const loaders = availableLocales.map(createLocaleLoader);

export const defaultLocale = "en";

const config = {
  fallbackLocale: "en",
  translations: trans,
  loaders: [
    {
      locale: "en",
      key: "",
      loader: async () => (await import("../../locales/en.json")).default,
    },
    {
      locale: "es",
      key: "",
      loader: async () => (await import("../../locales/es.json")).default,
    },
    {
      locale: "fr",
      key: "",
      loader: async () => (await import("../../locales/fr.json")).default,
    },
    {
      locale: "pt",
      key: "",
      loader: async () => (await import("../../locales/pt.json")).default,
    },
    {
      locale: "de",
      key: "",
      loader: async () => (await import("../../locales/de.json")).default,
    },
    {
      locale: "ja",
      key: "",
      loader: async () => (await import("../../locales/ja.json")).default,
    },
    {
      locale: "ru",
      key: "",
      loader: async () => (await import("../../locales/ru.json")).default,
    },
    {
      locale: "zh",
      key: "",
      loader: async () => (await import("../../locales/zh.json")).default,
    },
    {
      locale: "fa",
      key: "",
      loader: async () => (await import("../../locales/fa.json")).default,
    },
    {
      locale: "el",
      key: "",
      loader: async () => (await import("../../locales/el.json")).default,
    },
  ],
};

export const {
  t,
  loading,
  locales,
  locale,
  loadTranslations,
  addTranslations,
  translations,
  setLocale,
  setRoute,
} = new i18n(config);
