<script>
	import { browser } from '$app/environment';
	import { t } from '$lib/translations';
	import { AppHeader, Icon, Spinner } from '$comp';
	import { back } from '$lib/utils';

	export let form;

	let placeholder = 'Address, Invoice, Username';
	let text = placeholder,
		loading;

	let focus = () => {
		if (text === placeholder) text = '';
	};

	let paste = async () => {
		text = await navigator.clipboard.readText();
	};
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
	<Icon icon="arrow-left" style="w-10" />
</button>

<form method="POST" class="container px-4 mt-20 max-w-xl mx-auto">
	<div class="mb-2">
		<label for="invoice" class="font-bold mb-1 block">Destination</label>
		<input type="hidden" name="text" bind:value={text} />

		<div
			class="expandable-textarea"
			class:text-gray-400={text === placeholder}
			role="textbox"
			contenteditable
			bind:textContent={text}
			on:focus={focus}
		>
			{text}
		</div>
	</div>

	<div class="flex justify-end">
		<a href="/scan">
			<button
				type="button"
				class="flex border rounded-full px-6 py-2 font-bold hover:opacity-80 mr-1"
			>
				<Icon icon="scan" style="mr-2 w-6 my-auto" />
				<div class="my-auto">Scan</div>
			</button>
		</a>

		<button
			type="button"
			class="flex border rounded-full px-6 py-2 font-bold hover:opacity-80 mr-1"
			on:click={paste}
		>
			<Icon icon="paste" style="mr-2 w-6 my-auto" />
			<div class="my-auto">Paste</div>
		</button>

		<button
			type="submit"
			class="{!text
				? 'opacity-50'
				: 'opacity-100 hover:opacity-80'} bg-black text-white border rounded-full px-6 py-2 font-bold"
		>
			{#if loading}
				<Spinner />
			{:else}
				Next
			{/if}
		</button>
	</div>
</form>

<style>
	.expandable-textarea {
		font-family: inherit;
		font-size: inherit;

		resize: both;
		display: block;
		overflow: hidden;
		min-height: 48px;
		line-height: 20px;
		@apply block border rounded-2xl p-3 py-4 w-full bg-primary;
	}

	.expandable-expandable::-webkit-resizer {
		background: transparent;
	}
</style>
