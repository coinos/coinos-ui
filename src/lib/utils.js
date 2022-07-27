import { browser } from '$app/env';

export function scroll(section) {
	section.scrollIntoView({ behavior: 'smooth' });
}

const base = browser ? '' : import.meta.env.VITE_COINOS_URL;

export const post = (url, body) =>
	fetch(base + url, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { accept: 'application/json', 'content-type': 'application/json' }
	}).then((r) => r.json);
