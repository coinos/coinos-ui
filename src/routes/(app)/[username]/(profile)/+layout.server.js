import { get } from '$lib/utils';

export async function load({ parent }) {
	let { subject, user } = await parent();

	subject.follows = await get(`/${subject.pubkey}/follows`);
	subject.followers = await get(`/${subject.pubkey}/followers`);

  if (user) {
    user.follows = await get(`/${user.pubkey}/follows?tagsonly=true`);
  } 

  return { subject, user }
}
