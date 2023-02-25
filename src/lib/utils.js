import * as ecc from 'tiny-secp256k1';
import { BIP32Factory } from 'bip32';
import { browser } from '$app/environment';
import { toast } from '@zerodevx/svelte-toast';
import { goto } from '$app/navigation';
import { PUBLIC_COINOS_URL } from '$env/static/public';
import { page } from '$app/stores';
import { get as getStore } from 'svelte/store';

export function scroll(section) {
	if (getStore(page).url.pathname !== '/') goto('/');
	setTimeout(() => section.scrollIntoView({ behavior: 'smooth' }), 500);
}

const base = browser ? '' : PUBLIC_COINOS_URL;

export const punk = (k) => Math.floor((parseInt(k.slice(-2), 16) / 256) * 64) + 1 + '.webp';

export const g = (url, fetch, headers) =>
	fetch(base + url, { headers })
		.then((r) => r.text())
		.then((body) => {
			try {
				return JSON.parse(body);
			} catch (e) {
				throw new Error(body);
			}
		});

export const get = (url, headers = {}) =>
	fetch(base + url, { headers })
		.then(async (r) => {
			if (r.ok) return r.text();
			throw new Error(await r.text());
		})
		.then((body) => {
			try {
				return JSON.parse(body);
			} catch (e) {
				return body;
			}
		});

export const post = (url, body, headers) => {
	headers = { ...headers, 'content-type': 'application/json', accept: 'application/json' };
	return fetch(base + url, { method: 'POST', body: JSON.stringify(body), headers })
		.then(async (r) => {
			if (r.ok) return r.text();
			let text = await r.text();

			let message;
			try {
				({ message } = JSON.parse(text));
			} catch (e) {}

			if (message) throw new Error(message);
			throw new Error(text);
		})
		.then((body) => {
			try {
				body = JSON.parse(body);
			} catch (e) {
				throw new Error(body);
			}

			if (body.error instanceof Error) throw body.error;
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

export let protectedRoutes = [/customers/, /settings/, /payments/];

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
export const fail = (m) => {
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
			'--toastBarBackground': 'white'
		}
	});
};

export const login = async (user, cookies) => {
	let maxAge = 30 * 24 * 60 * 60;

	let res = await fetch(base + '/login', {
		method: 'POST',
		body: JSON.stringify(user),
		headers: { 'content-type': 'application/json', accept: 'application/json' }
	});
	if (res.status === 401) {
		let text = await res.text();
		if (text.startsWith('2fa')) throw new Error('2fa');
	}

	let { token } = await res.json();
	if (!token) throw new Error('Login failed');

	let expires = new Date();
	expires.setSeconds(expires.getSeconds() + maxAge);

	let opts = { path: '/', expires };
	cookies.set('username', user.username, opts);
	cookies.set('token', token, opts);
};

export const auth = (cookies) => ({ authorization: `Bearer ${cookies.get('token')}` });

export const fiat = (amount, rate) => (amount * rate) / sats;
export const fd = async (req) => {
	let obj = Object.fromEntries(await req.formData());
	for (let k in obj)
		(obj[k] === 'undefined' && (obj[k] = undefined)) || (obj[k] === 'false' && (obj[k] = false));
	return obj;
};

export const f = (s, currency) =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency
	})
		.format(s)
		.replace('CA', '');

export const s = (s) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(s);
export const sat = (s) => {
	s = Math.abs(s);
	let p = Math.floor(Math.log(s) / Math.LN10 + 0.000000001);
	let d = Math.floor((p + 1) / 3);

	return (
		'⚡️' +
		(parseInt(s) > 0
			? new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(s / Math.pow(1000, d)) +
			  ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z'][d]
			: 0
		).toString()
	);
};

export const sats = 100000000;

export const back = () => browser && history.go(-1);
export const focus = (el) => browser && screen.width > 1280 && setTimeout(() => el.focus(), 1);

export const sleep = (n) => new Promise((r) => setTimeout(r, n));
export const wait = async (f, n = 100, s = 300) => {
	let i = 0;
	while (!(await f()) && i < s) (await sleep(n)) && i++;
	if (i >= s) throw new Error('timeout');
	return f();
};

export const stretch = async (password, salt) =>
	crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt,
			iterations: 100000,
			hash: 'SHA-256'
		},
		await crypto.subtle.importKey(
			'raw',
			new TextEncoder().encode(password),
			{ name: 'PBKDF2' },
			false,
			['deriveBits', 'deriveKey']
		),
		{ name: 'AES-GCM', length: 256 },
		true,
		['encrypt', 'decrypt']
	);

export const bip32 = await BIP32Factory(ecc);

function get_bigrams(string) {
	var s = string.toLowerCase();
	var v = s.split('');
	for (var i = 0; i < v.length; i++) {
		v[i] = s.slice(i, i + 2);
	}
	return v;
}

export function ss(str1, str2) {
	if (str1.length > 0 && str2.length > 0) {
		var pairs1 = get_bigrams(str1);
		var pairs2 = get_bigrams(str2);
		var union = pairs1.length + pairs2.length;
		var hits = 0;
		for (var x = 0; x < pairs1.length; x++) {
			for (var y = 0; y < pairs2.length; y++) {
				if (pairs1[x] == pairs2[y]) hit_count++;
			}
		}
		if (hits > 0) return (2.0 * hits) / union;
	}

	return 0.0;
}

export const types = {
	bitcoin: 'bitcoin',
	lightning: 'lightning',
	internal: 'internal',
	pot: 'pot',
	classic: 'classic'
};
