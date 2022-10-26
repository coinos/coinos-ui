export let load = async ({ fetch }) => (await fetch('/locations')).json();
