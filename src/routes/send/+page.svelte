<script>
	import { browser } from '$app/environment';
	import { t } from '$lib/translations';
	import { AppHeader, Icon, Spinner } from '$comp';
	import { back, focus } from '$lib/utils';
	import parse from '$lib/parse';

	let text, loading;

	let paste = async () => {
		text = await navigator.clipboard.readText();
	};
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
	<Icon icon="arrow-left" style="w-10" />
</button>

<div class="container px-4 mt-20 max-w-xl mx-auto">
	<div>
		<label for="invoice" class="font-bold mb-1 block">Destination</label>

		<div class="relative mb-8">
			<input
				placeholder="Address, Invoice, Username"
				type="text"
				name="text"
				required
				bind:value={text}
				class="block rounded-2xl p-3 w-full bg-primary"
			/>

			<a href="/scan">
				<div class="flex absolute h-[48px] right-0 top-0 px-2 mt-[1px]">
					<Icon icon="scan" style="mr-2 w-6 my-auto" />
				</div>
			</a>

			{#if browser && navigator.clipboard}
				<div class="flex absolute h-[48px] right-10 top-0 px-2 mt-[1px]" on:click={paste}>
					<Icon icon="paste" style="mr-2 w-6 my-auto" />
				</div>
			{/if}
		</div>
	</div>

	<div class="flex w-full">
		<button
			class="{!text
				? 'opacity-50'
				: 'opacity-100 hover:opacity-80'} rounded-2xl border py-3 font-bold mx-auto mt-2 bg-black text-white px-4 w-24"
			on:click={() => parse(text)}
		>
			{#if loading}
				<Spinner />
			{:else}
				{$t('user.dashboard.go')}
			{/if}
		</button>
	</div>
</div>
