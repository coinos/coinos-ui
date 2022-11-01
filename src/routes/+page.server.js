export const prerender = true;
export let load = async ({ fetch }) => (await fetch('/locations')).json();
