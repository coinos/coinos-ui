<script>
	import { enhance } from '$app/forms';
	import Account from './_account.svelte';
	import Pos from './_pos.svelte';
	import Security from './_security.svelte';

	import { Icon } from '$comp';
	import { t } from '$lib/translations';
	import { failure, success } from '$lib/utils';
	import { avatarUpload, bannerUpload } from '$lib/store';
	import { upload } from '$lib/upload';

	export let data, form;

	let { user, rates, token } = data;
	$: update(data);
    let update = () => ({ user, rates, token } = data);

	let tab = 'account';

	let tabs = [
		{ name: 'account', key: 'ACCOUNT', comp: Account },
		{ name: 'pos', key: 'POINT_OF_SALE', comp: Pos },
		{ name: 'security', key: 'SECURITY', comp: Security }
	];

	$: ({ comp } = tabs.find((t) => t.name === tab));

	let save = async () => {
		try {
			if ($avatarUpload) {
				await upload($avatarUpload.file, $avatarUpload.type, $avatarUpload.progress, token);
			}
			if ($bannerUpload) {
				await upload($bannerUpload.file, $bannerUpload.type, $bannerUpload.progress, token);
			}
			success('Settings saved');
		} catch (e) {
			console.log(e);
			failure('Something went wrong');
		}
	};
</script>

<form method="POST" class="mb-[154px]" use:enhance on:submit={save}>
	<div class="mt-24 mb-20 px-3 md:px-0 w-full md:w-[400px] mx-auto space-y-8">
		<h1 class="text-center text-3xl md:text-4xl font-semibold mb-10">
			{$t('user.settings.header')}
		</h1>

		<div class="font-bold flex justify-between items-center border-b pb-3 text-secondary">
			{#each tabs as { name, key }}
				<button
					class="hover:opacity-80"
					class:text-black={tab === name}
					on:click|preventDefault={() => (tab = name)}>{$t(`user.settings.${key}`)}</button
				>
			{/each}
		</div>

		<svelte:component this={comp} {user} {rates} />
	</div>
	<div
		class="z-10 fixed bottom-0 bg-white shadow border-t w-full flex justify-center items-center py-3"
	>
		<button
			type="submit"
			class="bg-black text-white rounded-xl font-semibold mx-auto py-3 w-40 hover:opacity-80"
		>
			<div class="my-auto">Save Settings</div>
		</button>
	</div>
</form>
