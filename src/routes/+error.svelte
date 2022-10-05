<script>
	import { page } from '$app/stores';
	import { Icon, PageNotFound } from '$comp';
	import { t } from '$lib/translations';
	import { back } from '$lib/utils';

	export let data;
	let { user } = data;
</script>

{#if $page.error.message.includes('not found') || $page.status === 404}
	<PageNotFound />
{:else}
	<div class="container px-4 max-w-md mx-auto mt-20 text-center">
		<h1 class="text-center text-3xl md:text-4xl font-semibold mb-8">
			{$t('error.header')}
		</h1>

		<p class="px-1 break-all mb-8">{$page.error.message}</p>

		<button
			class="rounded-full bg-black text-white py-2 px-5 font-bold hover:opacity-80 mb-2"
			on:click={back}>Back</button
		>
	</div>
{/if}
