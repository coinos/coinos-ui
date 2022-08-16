import cookie from 'cookie';

const opts = {
	httpOnly: true,
	sameSite: 'lax',
	path: '/'
};

export async function load({ request: { headers } }) {
	throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292699)");
	return {
		status: 302,
		headers: {
			location: '/logout/done',
			'set-cookie': [
				cookie.serialize('token', '', {
					...opts,
					expires: new Date(0)
				}),
				cookie.serialize('refresh_token', '', {
					...opts,
					expires: new Date(0)
				})
			]
		}
	};
}
