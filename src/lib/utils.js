export function scroll(section) {
	section.scrollIntoView({ behavior: 'smooth' });
}

export const post = (url, body) =>
	fetch(url, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { 'accept': 'application/json', 'content-type': 'application/json' }
	});
