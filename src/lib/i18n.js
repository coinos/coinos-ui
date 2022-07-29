import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

let localeCodes = ['en', 'fr'];

// load locales
function addLocale(localeCode) {
  register(localeCode, () => import('../locales/' + localeCode + '.json'));
  console.log("Loaded locale '" + localeCode + "'");
}
localeCodes.forEach(addLocale);

init({
  fallbackLocale: 'en',
  initialLocale: getLocaleFromNavigator(),
});
