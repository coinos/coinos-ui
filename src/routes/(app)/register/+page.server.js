import {
	NumberDictionary,
	uniqueNamesGenerator,
	colors,
	adjectives,
	animals
} from 'unique-names-generator';
import { fail, redirect } from '@sveltejs/kit';
import { fd, post, login } from '$lib/utils';

export const load = async ({ parent }) => {
	let { user } = await parent();
	if (user) throw redirect(307, `/${user.username}`);

	let username = uniqueNamesGenerator({
		dictionaries: [animals, NumberDictionary.generate({ min: 10, max: 99 })],
		length: 2,
		separator: ''
	});

	let password = uniqueNamesGenerator({
		dictionaries: [colors, NumberDictionary.generate({ min: 100, max: 999 })],
		length: 2,
    separator: ''
	});

	let index = Math.floor(Math.random() * 64) + 1;

	return { index, username, password };
};

export const actions = {
	default: async ({ cookies, request }) => {
		let ip = request.headers.get('cf-connecting-ip');

		let form = await fd(request);
		let { profile, username, password, cipher, salt, pubkey, loginRedirect } = form;
		let user = { profile, username, password, cipher, salt, pubkey };
		let error;

		if (loginRedirect === 'undefined') loginRedirect = undefined;

		try {
			await post('/register', { user }, { 'cf-connecting-ip': ip });
		} catch (e) {
			console.log(e);
			if (e.message.includes('taken')) error = e.message;
		}

		try {
			await login(user, cookies, ip);
			error = null;
		} catch (e) {
			error ||= e.message;
		}

		if (error) return fail(400, { error });
		throw redirect(307, loginRedirect || `/${user.username}`);
	}
};
