<script>
	import { Left, Icon } from '$comp';
	import { focus, post, warning } from '$lib/utils';
	import { t } from '$lib/translations';

	export let v;
	export let cancel;

	let arrow = '<';
	let loading = false;

	const numPad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '<'];

	const handleInput = (n) => {
		v = (v || '').toString();
		if (n === 'C') return (v = '');
		if (n === '<') return (v = v.length > 1 ? Math.floor(v / 10) : '');
		if (v.length > 5) n = '';
		if (parseInt(n) >= 0) v += n;
	};

	let validate = (e) => {
		let k = e.key || e.code;
		if (k === 'Escape') cancel();
		if (e.key.length <= 1 && !(e.metaKey || e.ctrlKey || e.altKey) && !(k >= '0' && k <= '9')) {
			if (e.preventDefault) e.preventDefault();
			else e.returnValue = false;
		}
	};

	let hide = true;
</script>

<div class="flex justify-center items-center">
	<div class="space-y-5">
		<div class="text-5xl md:text-6xl font-semibold relative w-[300px]">
			{#if hide}
				<input
					on:keydown={validate}
					use:focus
					bind:value={v}
					type="password"
					class="outline-none border-0 text-center py-0"
					pattern="[0-9]+"
				/>
			{:else}
				<input
					on:keydown={validate}
					bind:value={v}
					class="outline-none border-0 text-center py-0"
					type="text"
					pattern="[0-9]+"
				/>
			{/if}
			<button type="button" on:click={() => (hide = !hide)} class="absolute -right-5 top-5">
				<Icon icon={hide ? 'eye-off' : 'eye'} style="w-8" />
			</button>
		</div>

		<div class="grid grid-cols-3 gap-2 w-[300px] mx-auto grayscale">
			{#each numPad as value}
				{#if value === arrow}
					<button
						type="button"
						class="bg-primary rounded-xl py-4 px-8 font-semibold active:bg-black active:text-white flex justify-center items-center hover:opacity-80"
						on:click={() => handleInput(value)}
					>
						<Left />
					</button>
				{:else}
					<button
						type="button"
						class="bg-primary rounded-xl py-4 px-8 font-semibold active:bg-black active:text-white hover:opacity-80"
						on:click={() => handleInput(value)}>{value}</button
					>
				{/if}
			{/each}
		</div>
	</div>
</div>
