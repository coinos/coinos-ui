import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { PUBLIC_COINOS_NETWORK, PUBLIC_COINOS_URL } from "$env/static/public";
import { toast } from "@zerodevx/svelte-toast";
import { get as getStore } from "svelte/store";

export function scroll(section: any) {
	if (getStore(page).url.pathname !== "/") goto("/");
	setTimeout(() => section.scrollIntoView({ behavior: "smooth" }), 500);
}

const base = browser ? "" : PUBLIC_COINOS_URL;

export const punk = (k: string) =>
	`${Math.floor((parseInt(k.slice(-2), 16) / 256) * 64) + 1}.webp`;

export const g = (url: string, fetch: any, headers: object) =>
	fetch(base + url, { headers })
		.then((r: Response) => r.text())
		.then((body: string) => {
			try {
				return JSON.parse(body);
			} catch (e) {
				throw new Error(body);
			}
		});

export const get = (url: string, headers = {}) => {
	return fetch(base + url, { headers })
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
};

export const post = async (
	url: string,
	body: object,
	headers: HeadersInit | undefined = undefined,
) => {
	headers = {
		"content-type": "application/json",
		accept: "application/json",
		...headers,
	};

	const response = await fetch(base + url, {
		method: "POST",
		body: JSON.stringify(body),
		headers,
	})
		.then(async (r) => {
			if (r.ok) return r.text();
			const text = await r.text();

			let message;
			try {
				({ message } = JSON.parse(text));
			} catch (e) {}

			if (message) throw new Error(message);
			throw new Error(text);
		})
		.then((body) => {
			let json;
			try {
				json = JSON.parse(body);
			} catch (e) {
				throw new Error(body);
			}

			if (json.error instanceof Error) throw json.error;
			if (json instanceof Error) throw body;
			if (json.name === "Error") throw new Error(json.message);

			return json;
		});

	return response;
};

export const copy = (text: string) => {
	navigator.clipboard.writeText(text);
	success("Copied!");
};

export const copyNoNewlines = (text: string) => {
	const stripped = text.replace(/\n/g, " ").replace(/\s+/g, " ");
	navigator.clipboard.writeText(stripped);
	success("Copied!");
};

export function reverseFormat(val: string, locale: string): number {
	const parts = new Intl.NumberFormat(locale).formatToParts(1111.1);
	const group = parts.find((part) => part.type === "group")?.value;
	const decimal = parts.find((part) => part.type === "decimal")?.value;
	let reversedVal = val.replace(new RegExp(`\\${group}`, "g"), "");
	reversedVal = reversedVal.replace(new RegExp(`\\${decimal}`, "g"), ".");
	return Number.isNaN(reversedVal) ? 0 : +reversedVal;
}

export const protectedRoutes: RegExp[] = [/customers/, /settings/, /payments/];

let recent: string[] = [];
export const success = (m: string, clear = true) => {
	if (recent.includes(m)) return;
	recent.push(m);
	setTimeout(() => (recent = []), 5000);
	if (clear) toast.pop();
	toast.push(m, {
		theme: {
			"--toastBarBackground": "#F5F7FA",
		},
	});
};

export const warning = (m: string, clear = true) => {
	if (clear) toast.pop();
	toast.push(m, {
		theme: {
			"--toastBarBackground": "#FFCE22",
		},
	});
};

export const fail = (m: string, clear = true) => {
	if (clear) toast.pop();
	toast.push(m, {
		theme: {
			"--toastBarBackground": "#E93535",
		},
	});
};

export const info = (m: string) => {
	toast.pop();
	toast.push(m, {
		theme: {
			"--toastBarBackground": "white",
		},
	});
};

export const login = async (
	user: { username: string; password: string },
	cookies: any,
	ip: string,
) => {
	const maxAge = 380 * 24 * 60 * 60;

	const res = await fetch(`${base}/login`, {
		method: "POST",
		body: JSON.stringify(user),
		headers: {
			"content-type": "application/json",
			accept: "application/json",
			"cf-connecting-ip": ip,
		},
	});
	if (res.status === 401) {
		const text = await res.text();
		if (text.startsWith("2fa")) throw new Error("2fa");
	}

	const { user: u, token } = await res.json();
	if (!token) throw new Error("Login failed");

	const expires = new Date();
	expires.setSeconds(expires.getSeconds() + maxAge);

	const opts = { path: "/", expires };
	if (u.language) cookies.set("lang", u.language, opts);
	cookies.set("username", user.username, opts);
	cookies.set("token", token, opts);
};

export const auth = (cookies: any) => ({
	authorization: `Bearer ${cookies.get("token")}`,
});

export const btc = (fiat: number, rate: number): number =>
	Math.round((fiat * sats) / rate);

export const fiat = (amount: number, rate: number): number =>
	(amount * rate) / sats;

export const fd = async (req: Request): Promise<any> => {
	const obj: Record<string, any> = Object.fromEntries(await req.formData());
	for (const k in obj)
		(obj[k] === "undefined" && (obj[k] = undefined)) ||
			(obj[k] === "false" && (obj[k] = false));
	return obj;
};

export const f = (s: number, currency: string): string => {
	try {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency,
		})
			.format(s)
			.replace("CA", "");
	} catch (e) {
		return "";
	}
};

export const s = (s: number): string =>
	new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(s);

export const sat = (s: number): string => `${si(Math.abs(s)).toString()}`;

export const si = (n: number, minimumFractionDigits = 1, maximumFractionDigits = 2) => {
	const units = ["", "K", "M", "G", "T", "P", "E", "Z"];

	let s = n;
	let d = 0;
	if (s >= 1000) {
		d = Math.floor(Math.log10(s) / 3); // Calculate the unit index
		s = n / 1000 ** d; // Scale the number to the correct unit
	}

	return (
		new Intl.NumberFormat("en-US", { minimumFractionDigits, maximumFractionDigits }).format(s) +
		units[d]
	);
};

export const sats = 100000000;

export const back = (): any =>
	browser && (history.length ? history.go(-1) : goto("/"));

export const focus = (el: HTMLElement): any =>
	browser && screen.width > 1280 && setTimeout(() => el.focus(), 1);

export const select = (el: HTMLInputElement): any =>
	browser && screen.width > 1280 && setTimeout(() => el.select(), 1);

export const sleep = (n: number): Promise<void> =>
	new Promise((r) => setTimeout(r, n));

export const wait = async (
	f: () => boolean | Promise<boolean>,
	n = 100,
	s = 300,
): Promise<boolean> => {
	let i = 0;
	while (!(await f()) && i < s) {
		await sleep(n);
		i++;
	}
	if (i >= s) throw new Error("timeout");
	return f();
};

export const stretch = async (password: string, salt: Uint8Array) =>
	crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt,
			iterations: 100000,
			hash: "SHA-256",
		},
		await crypto.subtle.importKey(
			"raw",
			new TextEncoder().encode(password),
			{ name: "PBKDF2" },
			false,
			["deriveBits", "deriveKey"],
		),
		{ name: "AES-GCM", length: 256 },
		true,
		["encrypt", "decrypt"],
	);

export const types = {
	bitcoin: "bitcoin",
	liquid: "liquid",
	lightning: "lightning",
	internal: "internal",
	fund: "fund",
	ecash: "ecash",
	reconcile: "reconcile",
};

export const ease = (t: number): number =>
	t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;

export function shuffleArray<T>(array: T[]): void {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

export const closest = (a: number[], n: number): number =>
	a.reduce((prev, curr) =>
		Math.abs(curr - n) < Math.abs(prev - n) ? curr : prev,
	);

export const isLiquid = (text: string): boolean =>
	text.startsWith("Az") ||
	text.startsWith("lq1") ||
	text.startsWith("VJL") ||
	text.startsWith("VT") ||
	text.startsWith("XR") ||
	text.startsWith("XC") ||
	((text.startsWith("H") || text.startsWith("G") || text.startsWith("Q")) &&
		text.length === 34) ||
	(text.startsWith("ert1q") && text.length === 43) ||
	(text.startsWith("ex1q") && text.length === 42) ||
	text.startsWith("el1qq") ||
	text.startsWith("lq1qq");

export function getCookie(name: string): string | null {
	const nameEQ = `${name}=`;
	const ca = document.cookie.split(";");
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === " ") c = c.substring(1);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

export function setCookie(name: string, value: string, seconds: number): void {
	const now = new Date();
	now.setTime(now.getTime() + seconds * 1000);
	const expires = `expires=${now.toUTCString()}`;
	document.cookie = `${name}=${value};${expires};path=/`;
}

export const network = {
	bitcoin: {
		bech32: "bc",
		pubKeyHash: 0x00,
		scriptHash: 0x05,
		wif: 0x80,
	},
	regtest: {
		bech32: "bcrt",
		pubKeyHash: 0x6f,
		scriptHash: 0xc4,
		wif: 0xef,
	},
}[PUBLIC_COINOS_NETWORK];

export const versions = {
	bitcoin: {
		private: 0x0488ade4,
		public: 0x0488b21e,
	},
	regtest: {
		private: 0x04358394,
		public: 0x043587cf,
	},
}[PUBLIC_COINOS_NETWORK];
