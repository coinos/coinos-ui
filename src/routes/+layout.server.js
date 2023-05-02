import { auth, get } from '$lib/utils';
import { loadTranslations, locale } from '$lib/translations';
export const load = async ({ cookies, url }) => {
	let user;
	let token = cookies.get('token');
	if (token) {
		try {
			user = await get('/me', auth(cookies));
		} catch (e) {}
	}

	const { host, pathname } = url;
	const defaultLocale = user?.language || 'en'; // get from cookie, user session, ...
	const initLocale = locale.get() || defaultLocale; // set default if no locale already set
	await loadTranslations(initLocale, pathname); // keep this just before the `return`
	return { host, pathname };
};
