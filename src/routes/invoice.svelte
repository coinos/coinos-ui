<script>
	import { rate, user } from '$lib/store';
	import { onMount } from 'svelte';

  export let text;
</script>

QR code

{text}

{$rate}

{$user?.username}


{#each $user.payments as p}
  {p.amount}<br/>
{/each}

