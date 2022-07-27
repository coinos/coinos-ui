<script>
	import { rate, user, invoiceAmount } from '$lib/store';

	export let text;
</script>

{#if $user}
	{text}
	{$invoiceAmount}
	{$rate}
	{$user.username}
	{#each $user.payments as p}
		{p.amount}<br />
	{/each}
{/if}
