<script>
	import { rate, user } from '$lib/store';
	import { onMount } from 'svelte';

	export let text;
</script>

QR code
{#if $user}

{text}

{$rate}

{$user?.username}

{#each $user.payments as p}
	{p.amount}<br />
{/each}
{/if}
