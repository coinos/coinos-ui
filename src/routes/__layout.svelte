<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { connect } from '$lib/socket';
  import { token } from "$lib/store";
  import { session } from "$app/stores";
  import { browser } from "$app/env";

  browser && ($token ||= $session.token);
	onMount(connect);
</script>

<slot />
