import i18n from "sveltekit-i18n";

export const defaultLocale = "en";

const config = {
  fallbackLocale: "en",
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
    {
      locale: "ar",
      key: "",
      loader: async () => (await import("../../locales/ar.json")).default,
    },
    {
      locale: "hi",
      key: "",
      loader: async () => (await import("../../locales/hi.json")).default,
    },
    {
      locale: "bn",
      key: "",
      loader: async () => (await import("../../locales/bn.json")).default,
    },
    {
      locale: "tr",
      key: "",
      loader: async () => (await import("../../locales/tr.json")).default,
    },
    {
      locale: "ko",
      key: "",
      loader: async () => (await import("../../locales/ko.json")).default,
    },
    {
      locale: "it",
      key: "",
      loader: async () => (await import("../../locales/it.json")).default,
    },
    {
      locale: "nl",
      key: "",
      loader: async () => (await import("../../locales/nl.json")).default,
    },
    {
      locale: "th",
      key: "",
      loader: async () => (await import("../../locales/th.json")).default,
    },
    {
      locale: "pl",
      key: "",
      loader: async () => (await import("../../locales/pl.json")).default,
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
