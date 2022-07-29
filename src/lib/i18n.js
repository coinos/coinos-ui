import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

// list of locales to load
const localeCodes = ['en', 'fr'];

// load locales
function addLocale(localeCode) {
  register(localeCode, () => import(`../locales/${localeCode}.json`));
}

// determine locale
function pickLocale(navigatorLocale, availableLocales) {
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

// setup internationalization
export function setupI18n() {
  localeCodes.forEach(addLocale);
  let initialLocale = pickLocale(getLocaleFromNavigator(), localeCodes);

  init({
    fallbackLocale: 'en',
    initialLocale: initialLocale,
  });
}
