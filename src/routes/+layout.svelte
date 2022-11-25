<script>
	import '../app.css';
	import { page } from '$app/stores';

	let { host, pathname } = $page.url;
</script>

<svelte:head>
	<title>maven</title>
	<meta property="og:title" content="maven" />
	<meta name="twitter:title" content="maven" />

	<meta property="og:image" content={`${host}/icons/logo.svg`} />

	<meta property="og:type" content="website" />
	<meta property="og:description" content="An easy to use bitcoin web wallet" />
	<meta name="description" content="An easy to use bitcoin web wallet" />

	<meta name="keywords" content="maven easy bitcoin web wallet" />

	<meta name="twitter:image" content={`${host}/icons/logo.svg`} />
	<meta name="twitter:card" content="summary_large_image" />

	<meta property="og:url" content={host + pathname} />
	<meta name="twitter:site" content="@mavenwallet" />
	<meta name="twitter:creator" content="@mavenwallet" />
</svelte:head>

<slot />

<style global>
	:root {
		--toastContainerTop: auto;
		--toastContainerRight: auto;
		--toastContainerBottom: 8rem;
		--toastContainerLeft: calc(50vw - 8rem);
		--toastBackground: #292929;
	}
</style>
