<script>
	import { post } from '$lib/utils';
	export let data;
	let reset = (username) => post(`/${username}/reset`, { password });
	let { users } = data;
	let password;
</script>

{#each users as { balance, username, expected }}
	<div class="grid grid-cols-5">
		<div>{username}</div>
		<div>{balance}</div>
		<div>{expected}</div>
		<div><input bind:value={password} /></div>
		<div>
			<button
				class="text-sm md:text-lg rounded-full border py-2 px-4 hover:opacity-80 min-w-[72px] bg-black text-white"
				on:click={() => reset(username)}>Reset</button
			>
		</div>
	</div>
{/each}
