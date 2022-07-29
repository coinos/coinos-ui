import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

/** The list of locales to look for */
const localeCodes = ['en', 'fr'];

/** The directory where locale files are stored */
const localeDirectory = "../locales";

/**
 * Adds a new locale from the appropriate JSON file
 * @param {string} localeCode - the code of the locale to add
 */
function addLocale(localeCode) {
  register(localeCode, () => import(`${localeDirectory}/${localeCode}.json`));
}

/**
 * Determines the default locale.
 * @param {string} navigatorLocale - the locale given by the navigator
 * @param {array<string>} avalableLocales - a list of the available locales
 * @returns {string} chosen default locale
 */
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

// add locales
localeCodes.forEach(addLocale);

let initialLocale = pickLocale(getLocaleFromNavigator(), localeCodes);
init({
  fallbackLocale: 'en',
  initialLocale: initialLocale,
});
