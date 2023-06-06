<script>
	import { RegisterOrLogin } from '$comp';
	import { onMount } from 'svelte';
	import { animatedRate, pin } from '$lib/store';

	onMount(() => {
    $animatedRate = 0;
		$pin = undefined;
		localStorage.clear();
		sessionStorage.clear();
	});

	export let form;
</script>

<RegisterOrLogin pageID="signIn" bind:form />
