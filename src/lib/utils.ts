import { browser } from "$app/environment";
import { toast } from "@zerodevx/svelte-toast";
import { goto } from "$app/navigation";
import { PUBLIC_COINOS_URL } from "$env/static/public";
import { page } from "$app/stores";
import { get as getStore } from "svelte/store";

export function scroll(section: any) {
  if (getStore(page).url.pathname !== "/") goto("/");
  setTimeout(() => section.scrollIntoView({ behavior: "smooth" }), 500);
}

let base = browser ? "" : PUBLIC_COINOS_URL;

export let punk = (k: string) =>
  Math.floor((parseInt(k.slice(-2), 16) / 256) * 64) + 1 + ".webp";

export let g = (url: string, fetch: any, headers: object) =>
  fetch(base + url, { headers })
    .then((r: Response) => r.text())
    .then((body: string) => {
      try {
        return JSON.parse(body);
      } catch (e) {
        throw new Error(body);
      }
    });

export let get = (url: string, headers = {}) => {
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

export let post = async (url: string, body: object, headers: HeadersInit | undefined = undefined) => {
  headers = {
    "content-type": "application/json",
    accept: "application/json",
    ...headers,
  };

  let response = await fetch(base + url, {
    method: "POST",
    body: JSON.stringify(body),
    headers,
  })
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

export let copy = (text: string) => {
  navigator.clipboard.writeText(text);
  success("Copied!");
};

export let copyNoNewlines = (text: string) => {
  let stripped = text.replace(/\n/g, " ").replace(/\s+/g, " ");
  navigator.clipboard.writeText(stripped);
  success("Copied!");
};

export function reverseFormat(val: string, locale: string): number {
  let parts = new Intl.NumberFormat(locale).formatToParts(1111.1);
  let group = parts.find((part) => part.type === "group")!.value;
  let decimal = parts.find((part) => part.type === "decimal")!.value;
  let reversedVal = val.replace(new RegExp("\\" + group, "g"), "");
  reversedVal = reversedVal.replace(new RegExp("\\" + decimal, "g"), ".");
  return Number.isNaN(reversedVal) ? 0 : +reversedVal;
}

export let protectedRoutes: RegExp[] = [/customers/, /settings/, /payments/];

let recent: string[] = [];
export let success = (m: string, clear: boolean = true) => {
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

export let warning = (m: string, clear: boolean = true) => {
  if (clear) toast.pop();
  toast.push(m, {
    theme: {
      "--toastBarBackground": "#FFCE22",
    },
  });
};

export let fail = (m: string, clear: boolean = true) => {
  if (clear) toast.pop();
  toast.push(m, {
    theme: {
      "--toastBarBackground": "#E93535",
    },
  });
};

export let info = (m: string) => {
  toast.pop();
  toast.push(m, {
    theme: {
      "--toastBarBackground": "white",
    },
  });
};

export let login = async (
  user: { username: string; password: string },
  cookies: any,
  ip: string
) => {
  let maxAge = 380 * 24 * 60 * 60;

  let res = await fetch(base + "/login", {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "cf-connecting-ip": ip,
    },
  });
  if (res.status === 401) {
    let text = await res.text();
    if (text.startsWith("2fa")) throw new Error("2fa");
  }

  let { user: u, token } = await res.json();
  if (!token) throw new Error("Login failed");

  let expires = new Date();
  expires.setSeconds(expires.getSeconds() + maxAge);

  let opts = { path: "/", expires };
  if (u.language) cookies.set("lang", u.language, opts);
  cookies.set("username", user.username, opts);
  cookies.set("token", token, opts);
};

export let auth = (cookies: any) => ({
  authorization: `Bearer ${cookies.get("token")}`,
});

export let btc = (fiat: number, rate: number): number =>
  Math.round((fiat * sats) / rate);

export let fiat = (amount: number, rate: number): number =>
  (amount * rate) / sats;

export let fd = async (req: Request): Promise<any> => {
  let obj: Record<string, any> = Object.fromEntries(await req.formData());
  for (let k in obj)
    (obj[k] === "undefined" && (obj[k] = undefined)) ||
      (obj[k] === "false" && (obj[k] = false));
  return obj;
};

export let f = (s: number, currency: string): string => {
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

export let s = (s: number): string =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(s);

export let sat = (s: number): string => {
  s = Math.abs(s);
  let p = Math.floor(Math.log(s) / Math.LN10 + 0.000000001);
  let d = Math.floor((p + 1) / 3);

  return (
    "⚡️" +
    (parseInt(s.toString()) > 0
      ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
          s / Math.pow(1000, d)
        ) + ["", "K", "M", "G", "T", "P", "E", "Z"][d]
      : 0
    ).toString()
  );
};

export let sats = 100000000;

export let back = (): any =>
  browser && (history.length ? history.go(-1) : goto("/"));

export let focus = (el: HTMLElement): any =>
  browser && screen.width > 1280 && setTimeout(() => el.focus(), 1);

export let select = (el: HTMLInputElement): any =>
  browser && screen.width > 1280 && setTimeout(() => el.select(), 1);

export let sleep = (n: number): Promise<void> =>
  new Promise((r) => setTimeout(r, n));

export let wait = async (f: () => boolean | Promise<boolean>, n: number = 100, s: number = 300): Promise<boolean> => {
  let i = 0;
  while (!(await f()) && i < s) {
    await sleep(n);
    i++;
  }
  if (i >= s) throw new Error("timeout");
  return f();
};

export let stretch = async (password: string, salt: Uint8Array) =>
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
      ["deriveBits", "deriveKey"]
    ),
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

export let types = {
  bitcoin: "bitcoin",
  liquid: "liquid",
  lightning: "lightning",
  internal: "internal",
  fund: "fund",
  ecash: "ecash",
};

export let ease = (t: number): number =>
  t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;

export function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export let closest = (a: number[], n: number): number =>
  a.reduce((prev, curr) =>
    Math.abs(curr - n) < Math.abs(prev - n) ? curr : prev
  );

export let isLiquid = (text: string): boolean =>
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
  let nameEQ = name + "=";
  let ca = document.cookie.split(";");
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
  const expires = "expires=" + now.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}
