<script>
	import { page } from '$app/stores';
	import { Icon, PageNotFound } from '$comp';
	import { t } from '$lib/translations';
	import { back } from '$lib/utils';

	export let data;
	let { user } = data;

	$: message = $page.error.message;
	$: if (message.startsWith('Internal')) message = 'Something went wrong';
</script>

{#if $page.error.message.includes('not found') || $page.status === 404}
	<PageNotFound />
{:else}
	<div class="container px-4 max-w-lg mx-auto mt-20 space-y-5">
		<div class="w-[243px] mx-auto mb-10">
			<a href="/">
				<Icon icon="logo" />
			</a>
		</div>

		<div class="flex justify-center items-center">
			<div class="shadow-xl rounded-3xl p-10 pb-12 space-y-5 w-full mx-5 md:mx-0 md:w-[400px]">
				<h1 class="text-3xl md:text-4xl font-semibold">
					{$t('error.header')}
				</h1>

				<p class="text-secondary">
					{message}. If the problem persists, please
					<a href="/support" class="underline">let us know.</a>
				</p>

				<button
					class="rounded-full bg-black text-white py-2 px-5 font-bold hover:opacity-80 mb-2"
					on:click={back}>Back</button
				>
			</div>
		</div>
	</div>
{/if}
