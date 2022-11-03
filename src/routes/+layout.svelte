<script>
	import '../app.css';
</script>

<svelte:head>
	<title>coinos</title>
	<meta property="og:image" content="/icons/logo.svg" />
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
