<script>
	import { afterNavigate, invalidateAll } from '$app/navigation';
	import { RegisterOrLogin } from '$comp';
	export let form;

	afterNavigate(async () => {
		try {
			console.log('whoa');
			await invalidateAll();
			console.log('no');
		} catch (e) {
			console.log(e);
		}
	});
</script>

<RegisterOrLogin pageID="register" bind:form />
