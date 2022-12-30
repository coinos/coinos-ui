import { get } from '$lib/utils';

export async function load({ parent }) {
	let { subject, user } = await parent();

	subject.follows = [];
	subject.followers = [];

	try {
		subject.follows = await get(`/${subject.pubkey}/follows`);
	} catch (e) {
		console.log('problem fetching follows', e);
	}

	try {
		subject.followers = await get(`/${subject.pubkey}/followers`);
	} catch (e) {
		console.log('problem fetching followers', e);
	}

	if (user) {
		user.follows = await get(`/${user.pubkey}/follows?tagsonly=true`);
	}

	return { subject, user };
}
