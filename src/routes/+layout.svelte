<script>
	import '../app.css';
	import { loading, t } from '$lib/translations';

	export let data;
	let { host, pathname } = data;
</script>

<svelte:head>
	<title>coinos</title>
	<meta property="og:title" content="coinos" />
	<meta name="twitter:title" content="coinos" />

	<meta property="og:image" content={`${host}/icons/logo.svg`} />

	<meta property="og:type" content="website" />
	<meta property="og:description" content="An easy to use bitcoin web wallet" />
	<meta name="description" content="An easy to use bitcoin web wallet" />

	<meta name="keywords" content="coinos easy bitcoin web wallet" />

	<meta name="twitter:image" content={`${host}/icons/logo.svg`} />
	<meta name="twitter:card" content="summary_large_image" />

	<meta property="og:url" content={host + pathname} />
	<meta name="twitter:site" content="@coinoswallet" />
	<meta name="twitter:creator" content="@coinoswallet" />
</svelte:head>

{#if !$loading}
<slot />
{/if}

<style global>
	:root {
		--toastContainerTop: auto;
		--toastContainerRight: auto;
		--toastContainerBottom: 8rem;
		--toastContainerLeft: calc(50vw - 8rem);
		--toastBackground: #292929;
	}
</style>
