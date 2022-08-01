import { browser } from '$app/env';

export function scroll(section) {
	section.scrollIntoView({ behavior: 'smooth' });
}

const base = browser ? '' : import.meta.env.VITE_COINOS_URL;

export const get = (url) =>
	fetch(base + url, {
		headers: { accept: 'application/json' }
	}).then((r) => r.text()).then((body) => {
    try {
      return JSON.parse(body);
    } catch(e) {
      throw Error(body);
    } 
  }) 

export const post = (url, body) =>
	fetch(base + url, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { accept: 'application/json', 'content-type': 'application/json' }
	}).then((r) => r.json());

export const copy = (text) => {
	navigator.clipboard.writeText(text);
};
