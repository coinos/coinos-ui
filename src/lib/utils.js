import { browser } from '$app/environment';
import { toast } from '@zerodevx/svelte-toast';
import { goto } from '$app/navigation';
import { env } from '$env/dynamic/public';

export function scroll(section) {
	section.scrollIntoView({ behavior: 'smooth' });
}

const base = browser ? '' : env.PUBLIC_COINOS_URL;

export const get = (url, headers = {}) =>
	fetch(base + url, { headers })
		.then((r) => r.text())
		.then((body) => {
			try {
				return JSON.parse(body);
			} catch (e) {
				throw new Error(body);
			}
		});

export const post = (url, body, headers) => {
	headers = { ...headers, 'content-type': 'application/json', accept: 'application/json' };
	return fetch(base + url, { method: 'POST', body: JSON.stringify(body), headers })
		.then((r) => r.text())
		.then((body) => {
			try {
				body = JSON.parse(body);
			} catch (e) {
				throw new Error(body);
			}

			if (body instanceof Error) throw body;
			if (body.name === 'Error') throw new Error(body.message);

			return body;
		});
};

export const copy = (text) => {
	navigator.clipboard.writeText(text);
	success('Copied!');
};

export function reverseFormat(val, locale) {
	let parts = new Intl.NumberFormat(locale).formatToParts(1111.1);
	let group = parts.find((part) => part.type === 'group').value;
	let decimal = parts.find((part) => part.type === 'decimal').value;
	let reversedVal = val.replace(new RegExp('\\' + group, 'g'), '');
	reversedVal = reversedVal.replace(new RegExp('\\' + decimal, 'g'), '.');
	return Number.isNaN(reversedVal) ? 0 : +reversedVal;
}

export let protectedRoutes = [
	/receive/,
	/customers/,
	/dashboard/,
	/settings/,
	/transactions/,
	/support/
];

export const success = (m) => {
	toast.pop();
	toast.push(m, {
		theme: {
			'--toastBarBackground': '#F5F7FA'
		}
	});
};

export const warning = (m) => {
	toast.pop();
	toast.push(m, {
		theme: {
			'--toastBarBackground': '#FFCE22'
		}
	});
};
export const failure = (m) => {
	toast.pop();
	toast.push(m, {
		theme: {
			'--toastBarBackground': '#E93535'
		}
	});
};
export const info = (m) => {
	toast.pop();
	toast.push(m, {
		theme: {
			'--toastBarBackground': '#1C69FF'
		}
	});
};

export const login = async (user, cookies) => {
	let maxAge = 30 * 24 * 60 * 60;
	let { token } = await post('/login', user);

	let expires = new Date();
	expires.setSeconds(expires.getSeconds() + maxAge);

	cookies.set('token', token, { path: '/' });
};

export const auth = (cookies) => ({ authorization: `Bearer ${cookies.get('token')}` });

export const f = (s, currency) =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency
	})
		.format(s)
		.replace('CA', '');

export const s = (s) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(s);

export const sats = 100000000;

export const back = () => {
	browser && history.go(-1);
};

export const focus = (el) => setTimeout(() => el.focus());
