<script>
	import Account from './_account.svelte';
	import Pos from './_pos.svelte';
	import Security from './_security.svelte';

	import { AppHeader, Icon } from '$comp';
	import { t } from '$lib/translations';
	import { failure, success, put } from '$lib/utils';
	import { user } from '$lib/store';

	let tab = 'account';

	let tabs = [
		{ name: 'account', key: 'ACCOUNT', comp: Account },
		{ name: 'pos', key: 'POINT_OF_SALE', comp: Pos },
		{ name: 'security', key: 'SECURITY', comp: Security }
	];

	$: ({ comp } = tabs.find((t) => t.name === tab));

	let save = async () => {
		try {
			await put('/user', $user);
			success('Settings saved');
		} catch (e) {
			failure('Something went wrong');
		}
	};
</script>

<AppHeader />

<form on:submit|preventDefault={save}>
	<div class="my-20 px-3 md:px-0 w-full md:w-[400px] mx-auto space-y-8">
		<h1 class="text-center text-3xl md:text-4xl font-semibold mb-10">
			{$t('user.settings.header')}
		</h1>

		<div class="font-bold flex justify-between items-center border-b pb-3 text-secondary">
			{#each tabs as { name, key }}
				<button class:text-black={tab === name} on:click|preventDefault={() => (tab = name)}
					>{$t(`user.settings.${key}`)}</button
				>
			{/each}
		</div>

		<svelte:component this={comp} />
	</div>
	<div class="fixed bottom-0 bg-white shadow border w-full">
		<button type="submit" class="primary">
			<Icon icon="save" style="w-6 h-6 mr-1" />
			<div class="my-auto">Save Settings</div>
		</button>
	</div>
</form>

