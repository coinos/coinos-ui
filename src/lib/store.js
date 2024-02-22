import { get, writable } from "svelte/store";
import { browser } from "$app/environment";

let persistSession = (key, defaultValue) => {
  let s = writable(
    browser &&
      sessionStorage.getItem(key) &&
      sessionStorage.getItem(key) !== "undefined"
      ? JSON.parse(sessionStorage.getItem(key))
      : defaultValue
  );

  s.subscribe((v) => {
    browser && sessionStorage.setItem(key, JSON.stringify(v));
  });

  return s;
};

let persistLocal = (key, defaultValue) => {
  let s = writable(
    browser &&
      localStorage.getItem(key) &&
      localStorage.getItem(key) !== "undefined"
      ? JSON.parse(localStorage.getItem(key))
      : defaultValue
  );

  s.subscribe((v) => {
    try {
      browser && localStorage.setItem(key, JSON.stringify(v));
    } catch (e) {
      console.log("problem setting key", v);
      console.log(e);
    }
  });

  return s;
};

export let avatar = writable();
export let banner = writable();
export let event = writable();
export let events = writable({});
export let invoice = writable();
export let last = writable();
export let loginRedirect = writable();
export let decrypted = persistLocal("decrypted", {});
export let newPayment = persistLocal("newPayment");
export let password = writable();
export let passwordPrompt = writable();
export let pin = persistSession("pin");
export let rate = writable();
export let request = writable();
export let requestRedirect = writable();
export let token = persistSession("token");
export let user = writable();
export let ndef = writable();
export let showQr = persistLocal("showQr");
