<script>
	export let data;
	let { users } = data;
</script>

{#each users as { balance, username }}
	<div class="grid grid-cols-2">
		<div>{username}</div>
		<div>{balance}</div>
	</div>
{/each}
