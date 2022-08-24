import i18n from 'sveltekit-i18n';
import lang from './lang.json';

// setup loaders & translations from lang.json data
function createLocaleLoader(localeCode) {
	return {
		locale: localeCode,
		key: '',
		loader: async () => (await import(`../../locales/${localeCode}.json`)).default
	};
}

const availableLocales = Object.keys(lang);
const translations = {};
for (let i = 0; i < availableLocales.length; i++) {
	translations[availableLocales[i]] = { lang };
}
const loaders = availableLocales.map(createLocaleLoader);

const config = {
	initLocale: 'en',
	fallbackLocale: 'en',
	translations: translations,
	loaders: [
		{
			locale: 'en',
			key: '',
			loader: async () => (await import('../../locales/en.json')).default
		},
		{
			locale: 'fr',
			key: '',
			loader: async () => (await import('../../locales/fr.json')).default
		}
	]
};

export const { t, l, locales, locale } = new i18n(config);
