import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

let localeCodes = ['en', 'fr'];

// load locales
function addLocale(localeCode) {
  register(localeCode, () => import('../locales/' + localeCode + '.json'));
  console.log("Loaded locale '" + localeCode + "'");
}
localeCodes.forEach(addLocale);

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

let initialLocale = pickLocale(getLocaleFromNavigator(), localeCodes);
console.log("Selected locale '" + initialLocale + "'");

init({
  fallbackLocale: 'en',
  initialLocale: initialLocale,
});
