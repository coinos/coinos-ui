<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { connect } from '$lib/socket';

	onMount(connect);
</script>

<slot />
