<script>
	import { RegisterOrLogin } from '$comp';
	import { onMount } from 'svelte';
	import { pin } from '$lib/store';

	onMount(() => {
		$pin = undefined;
		localStorage.clear();
		sessionStorage.clear();
	});

	export let form;
</script>

<RegisterOrLogin pageID="signIn" bind:form />
