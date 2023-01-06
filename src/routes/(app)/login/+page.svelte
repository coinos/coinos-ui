<script>
	import { messages } from '$lib/store';
	import { RegisterOrLogin } from '$comp';

	export let form;
</script>

<RegisterOrLogin pageID="signIn" bind:form />
