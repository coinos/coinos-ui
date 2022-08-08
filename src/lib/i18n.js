import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

// The list of locales to look for
// ADD ALL NEW LANGUAGE CODES TO THIS LIST
const localeCodes = ["en", "fr"];

// the default locale to use if none was found
const defaultLocale = "en";

// Adds a new locale based on its code
function addLocale(localeCode) {
  register(localeCode, () => import(`../locales/${localeCode}.json`));
}

// Picks the default locale based on navigator locale and the list of available locales
function pickLocale(navigatorLocale, availableLocales) {
  // locale can be null the first time you load this
  // return the default locale in that case - reloading should fix this
  if (!navigatorLocale)
    return defaultLocale;

  // determine langugage part of locale
  // (e.g. if navigatorLocale is 'en-US', languageCode is 'en')
  let dashIndex = navigatorLocale ? navigatorLocale.indexOf("-") : -1;
  let languageCode; // navigator locale without the regional part
  if (dashIndex === -1) {
    languageCode = navigatorLocale;
  } else {
    languageCode = navigatorLocale.slice(0, dashIndex);
  }

  // get locale
  if (availableLocales.includes(navigatorLocale)) {
    return navigatorLocale;
  } else if (availableLocales.includes(languageCode)) {
    return languageCode;
  } else {
    return null;
  }
}

// add locales
localeCodes.forEach(addLocale);

let initialLocale = pickLocale(getLocaleFromNavigator(), localeCodes);
init({
  fallbackLocale: defaultLocale,
  initialLocale: initialLocale,
});
