import cookie from 'cookie';
export async function handle({ event, resolve }) {
	let {
		request: { headers }
	} = event;

	const cookies = cookie.parse(headers.get('cookie') || '');
	let { token } = cookies;
	event.locals = { token };

	return resolve(event);
}

export const getSession = ({ locals: { token } }) => {
	return { token };
};
