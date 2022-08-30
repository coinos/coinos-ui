<script>
	import Account from './_account.svelte';
	import Pos from './_pos.svelte';
	import Security from './_security.svelte';

	import { AppHeader, Icon } from '$comp';
	import { user, colorTheme, rates, token } from '$lib/store';
	import { t } from '$lib/translations';
	import { success, failure, put } from '$lib/utils';

	let tab = 'account';

	let tabs = [
		{ name: 'account', key: 'ACCOUNT', comp: Account },
		{ name: 'pos', key: 'POINT_OF_SALE', comp: Pos },
		{ name: 'security', key: 'SECURITY', comp: Security }
	];

	$: ({ comp } = tabs.find((t) => t.name === tab));
</script>

{#if $user}
	<AppHeader />

	<div class="my-20 px-3 md:px-0 w-full md:w-[400px] mx-auto space-y-8">
		<h1 class="text-center text-3xl md:text-4xl font-semibold mb-10">
			{$t('user.settings.header')}
		</h1>

		<div class="font-bold flex justify-between items-center border-b pb-3 text-secondary">
			{#each tabs as { name, key }}
				<button class:text-black={tab === name} on:click={() => (tab = name)}
					>{$t(`user.settings.${key}`)}</button
				>
			{/each}
		</div>

		<svelte:component this={comp} />
	</div>
{/if}
