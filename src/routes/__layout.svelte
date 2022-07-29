<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { connect } from '$lib/socket';

  import '$lib/i18n';

	onMount(connect);
</script>

<slot />
