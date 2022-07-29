<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { connect } from '$lib/socket';

  import { setupI18n } from '$lib/i18n';

	onMount(connect);
  setupI18n();
</script>

<slot />
