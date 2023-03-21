<script>
	export let data;
	let { users } = data;
</script>

{#each users as { balance, username, expected }}
	<div class="grid grid-cols-3">
		<div>{username}</div>
		<div>{balance}</div>
		<div>{expected}</div>
	</div>
{/each}
