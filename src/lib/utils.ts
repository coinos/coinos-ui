import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { PUBLIC_COINOS_NETWORK, PUBLIC_COINOS_URL } from "$env/static/public";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";
import { fail as svelteFail, redirect } from "@sveltejs/kit";
import { toast } from "@zerodevx/svelte-toast";

import { get as getStore } from "svelte/store";

export function scroll(section: any) {
  if (getStore(page).url.pathname !== "/") goto("/");
  setTimeout(() => section.scrollIntoView({ behavior: "smooth" }), 500);
}

const base = browser ? "/api" : PUBLIC_COINOS_URL;

let getIp: (() => string | undefined) | undefined;

export const setIpGetter = (fn: () => string | undefined) => {
  getIp = fn;
};

const ipHeaders = (): Record<string, string> => {
  const ip = getIp?.();
  return ip ? { "cf-connecting-ip": ip } : {};
};

export const hashPin = (pin: string) => bytesToHex(sha256(utf8ToBytes(pin)));

export const punk = (k: string) => `${Math.floor((parseInt(k.slice(-2), 16) / 256) * 64) + 1}.webp`;

export const g = (url: string, fetch: any, headers: object) =>
  fetch(base + url, { headers: { ...ipHeaders(), ...headers } })
    .then((r: Response) => r.text())
    .then((body: string) => {
      try {
        return JSON.parse(body);
      } catch {
        throw new Error(body);
      }
    });

export const get = (url: string, headers = {}) => {
  return fetch(base + url, { headers: { ...ipHeaders(), ...headers } })
    .then(async (r) => {
      if (r.ok) return r.text();
      const text = await r.text();
      throw new Error(text.replace(/^"|"$/g, ""));
    })
    .then((body) => {
      try {
        return JSON.parse(body);
      } catch {
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
    ...ipHeaders(),
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
      } catch {}

      if (message) throw new Error(message);
      throw new Error(text.replace(/^"|"$/g, ""));
    })
    .then((body) => {
      let json;
      try {
        json = JSON.parse(body);
      } catch {
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
  user: {
    username: string;
    password: string;
    token?: string;
    challenge?: string;
    recaptcha?: string;
    authPubkey?: string;
  },
  cookies,
  ip: string,
  host?: string,
  extraHeaders?: Record<string, string>,
) => {
  const maxAge = 380 * 24 * 60 * 60;

  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json",
    "cf-connecting-ip": ip,
    ...extraHeaders,
  };
  if (host) headers["x-forwarded-host"] = host;

  const res = await fetch(`${base}/login`, {
    method: "POST",
    body: JSON.stringify(user),
    headers,
  });

  const text = await res.text();

  if (res.status === 401) {
    if (text.startsWith("2fa")) throw new Error("2fa");
    throw new Error(text);
  }

  const { user: u, token } = JSON.parse(text);
  if (!token) throw new Error("Login failed");

  const expires = new Date();
  expires.setSeconds(expires.getSeconds() + maxAge);

  const opts = { path: "/", expires };
  if (u.language) cookies.set("lang", u.language, opts);
  cookies.set("username", user.username, { ...opts, httpOnly: false });
  cookies.set("token", token, opts);
  if (u.nsec) {
    try {
      const { decrypt } = await import("nostr-tools/nip49");
      cookies.set("sk", bytesToHex(decrypt(u.nsec, user.password)), {
        ...opts,
        httpOnly: false,
        sameSite: "lax",
      });
    } catch {}
  }

  return u;
};

export const auth = (cookies) => ({
  authorization: `Bearer ${cookies.get("token")}`,
});

export const isInvalidTokenError = (e: unknown) => {
  const message = (e as Error)?.message || "";
  if (!message) return false;
  const normalized = message.toLowerCase();
  return (
    normalized.includes("jwt") ||
    normalized.includes("invalid token") ||
    normalized.includes("token expired") ||
    normalized.includes("expired token") ||
    normalized.includes("unauthorized") ||
    normalized.includes("not authorized")
  );
};

export const btc = (fiat: number, rate: number): number => Math.round((fiat * sats) / rate);

export const toFiat = (amount: number, rate: number): number => (amount * rate) / sats;

export const fd = async (req: Request): Promise<any> => {
  const obj: Record<string, any> = Object.fromEntries(await req.formData());
  for (const k in obj)
    (obj[k] === "undefined" && (obj[k] = undefined)) || (obj[k] === "false" && (obj[k] = false));
  return obj;
};

export const localeMap = {
  en: {
    CAD: "en-CA",
    USD: "en-US",
    GBP: "en-GB",
    AUD: "en-AU",
    EUR: "en-IE", // Eurozone English (Ireland)
    NZD: "en-NZ",
    JPY: "en-JP", // English in Japan
    INR: "en-IN", // English in India
    ZAR: "en-ZA", // South Africa
  },
  fr: {
    CAD: "fr-CA", // French Canada
    EUR: "fr-FR", // France
    CHF: "fr-CH", // French Switzerland
    XOF: "fr-SN", // Francophone West Africa
  },
  de: {
    EUR: "de-DE", // Germany
    CHF: "de-CH", // German Switzerland
    USD: "de-US", // German for the US
  },
  es: {
    EUR: "es-ES", // Spain
    USD: "es-US", // Spanish for the US
    MXN: "es-MX", // Mexico
    ARS: "es-AR", // Argentina
    CLP: "es-CL", // Chile
  },
  pt: {
    EUR: "pt-PT", // Portugal
    BRL: "pt-BR", // Brazil
  },
  zh: {
    CNY: "zh-CN", // Simplified Chinese (Mainland China)
    HKD: "zh-HK", // Traditional Chinese (Hong Kong)
    TWD: "zh-TW", // Traditional Chinese (Taiwan)
    USD: "zh-US", // Chinese for the US
  },
  ja: {
    JPY: "ja-JP", // Japan
    USD: "ja-US", // Japanese for the US
  },
  ru: {
    RUB: "ru-RU", // Russia
    USD: "ru-US", // Russian for the US
  },
  el: {
    EUR: "el-GR", // Greece
  },
  fa: {
    IRR: "fa-IR", // Iran
  },
  // Global currency mappings (fallbacks)
  CAD: "en-CA",
  USD: "en-US",
  GBP: "en-GB",
  AUD: "en-AU",
  EUR: "en-IE",
  NZD: "en-NZ",
  JPY: "ja-JP",
  INR: "en-IN",
  ZAR: "en-ZA",
  CHF: "de-CH",
  MXN: "es-MX",
  BRL: "pt-BR",
  CNY: "zh-CN",
  HKD: "zh-HK",
  TWD: "zh-TW",
  RUB: "ru-RU",
  IRR: "fa-IR",
};

export const loc = (user) => {
  if (!user) return;
  const { currency: c, language: l } = user;
  return localeMap[l]?.[c] || localeMap[c];
};

export const f = (
  s: number,
  currency: string,
  locale = "",
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
) => {
  const cur = currency || "USD";
  const l =
    typeof locale === "function" ? (locale as () => string)() : locale || localeMap[cur] || "en-US";
  const region = l.length >= 2 ? l.slice(-2) : "";
  const currencyDisplay = region && cur.startsWith(region) ? "narrowSymbol" : "symbol";
  return new Intl.NumberFormat(l, {
    style: "currency",
    currency: cur,
    currencyDisplay,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(s);
};

export const s = (s: number, locale = "en-US"): string => {
  const l = typeof locale === "function" ? (locale as () => string)() : locale || "en-US";
  return new Intl.NumberFormat(l, { maximumFractionDigits: 0 }).format(s);
};

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
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(s) + units[d]
  );
};

export const sats = 100000000;

export const back = (): any => browser && (history.length ? history.go(-1) : goto("/"));

export const focus = (el: HTMLElement): any =>
  browser && screen.width > 1280 && setTimeout(() => el.focus(), 1);

export const select = (el: HTMLInputElement): any =>
  browser && screen.width > 1280 && setTimeout(() => el.select(), 1);

export const sleep = (n: number): Promise<void> => new Promise((r) => setTimeout(r, n));

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

export const types = {
  ark: "ark",
  bitcoin: "bitcoin",
  liquid: "liquid",
  lightning: "lightning",
  internal: "internal",
  fund: "fund",
  ecash: "ecash",
  bolt12: "bolt12",
};

export const ease = (t: number): number => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t);

export function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export const closest = (a: number[], n: number): number =>
  a.reduce((prev, curr) => (Math.abs(curr - n) < Math.abs(prev - n) ? curr : prev));

export const isLiquid = (text: string): boolean =>
  text.startsWith("Az") ||
  text.startsWith("lq1") ||
  text.startsWith("VJL") ||
  text.startsWith("VT") ||
  text.startsWith("XR") ||
  text.startsWith("XC") ||
  ((text.startsWith("H") || text.startsWith("G") || text.startsWith("Q")) && text.length === 34) ||
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

export const str = (s) => s.toString();

const localeTagMap: Record<string, string> = {
  en: "en-US",
  fa: "fa-IR",
  zh: "zh-CN",
  ar: "ar-SA",
};
export const toLocaleTag = (lang = "en") => localeTagMap[lang] || lang;

export const formatDate = (date: Date, lang = "en", opts: Intl.DateTimeFormatOptions = {}) =>
  new Intl.DateTimeFormat(toLocaleTag(lang), opts).format(date);

export const ago = (t) => {
  const diff = Math.floor((Date.now() - t * 1000) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

export const register = async (
  user,
  ip,
  cookies,
  loginRedirect,
  host?,
  extraHeaders?: Record<string, string>,
) => {
  let error;

  const headers: Record<string, string> = {
    ...extraHeaders,
  };
  if (ip) headers["cf-connecting-ip"] = ip;

  // Derive authPubkey if password provided
  if (user.password && user.username) {
    try {
      const { deriveAuthKeypair } = await import("$lib/deriveAuthKey");
      const { pubkey: authPubkey } = await deriveAuthKeypair(user.username, user.password);
      user.authPubkey = authPubkey;
    } catch (e) {
      console.log("Failed to derive authPubkey during registration", e);
    }
  }

  let sk, token;
  try {
    ({ sk, token } = await post("/register", { user }, headers));
  } catch (e) {
    ({ message: error } = e as Error);
  }

  if (user.password) {
    try {
      await login(user, cookies, ip, host, extraHeaders);
      error = null;
    } catch (e) {
      const { message } = e as Error;
      error ||= message;
    }
  } else if (token) {
    const maxAge = 380 * 24 * 60 * 60;
    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + maxAge);
    const opts = { path: "/", expires };
    cookies.set("username", user.username, { ...opts, httpOnly: false });
    cookies.set("token", token, opts);
    error = null;
  }

  const expires = new Date();
  expires.setSeconds(expires.getSeconds() + 21000000);
  if (sk) {
    cookies.set("sk", sk, {
      path: "/",
      expires,
      httpOnly: false,
      sameSite: "lax",
    });
  }

  if (error) return svelteFail(400, { error });
  redirect(303, loginRedirect || `/${user.username}`);
};
