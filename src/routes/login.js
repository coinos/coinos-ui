import got from 'got';

export async function POST({ request }) {
  let json = await request.json();

  let body = await got
		.post('http://localhost:3119/login', {
			json
		})
		.json();

	return { body };
}
