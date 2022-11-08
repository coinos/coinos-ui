<script>
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import Account from './_account.svelte';
	import Pos from './_pos.svelte';
	import Security from './_security.svelte';

	import { Icon, Spinner, Pin } from '$comp';
	import { t } from '$lib/translations';
	import { failure, success } from '$lib/utils';
	import { avatarUpload, bannerUpload, pin } from '$lib/store';
	import { upload } from '$lib/upload';

	export let data;
	export let form;

	let { user, token } = data;
	$: update(data);
	let update = () => ({ user, token } = data);

	$: form?.user && ({ user } = form);

	$: if (form?.message?.startsWith('Pin')) {
		failure('Wrong pin, try again');
		$pin = '';
	}

	let tab = 'account';

	let tabs = [
		{ name: 'account', key: 'ACCOUNT', comp: Account },
		{ name: 'pos', key: 'POINT_OF_SALE', comp: Pos },
		{ name: 'security', key: 'SECURITY', comp: Security }
	];

	$: ({ comp } = tabs.find((t) => t.name === tab));

	let loading, submit;
	let save = async (msg) => {
		loading = true;

		try {
			if ($avatarUpload) {
				await upload($avatarUpload.file, $avatarUpload.type, $avatarUpload.progress, token);
			}

			if ($bannerUpload) {
				await upload($bannerUpload.file, $bannerUpload.type, $bannerUpload.progress, token);
			}
		} catch (e) {
			console.log(e);
			failure('Something went wrong');
		}

		loading = false;
	};

	let loaded;
	onMount(() => setTimeout(() => (loaded = true), 50));
</script>

{#if loaded && user.haspin && $pin?.length !== 6}
	<Pin />
{/if}

<form method="POST" class="mb-[154px]" use:enhance on:submit={save}>
	<input type="hidden" name="pin" value={$pin} />

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

		<svelte:component this={comp} {user} {submit} />
	</div>

	<div
		class="z-10 fixed bottom-0 bg-white shadow border-t w-full flex justify-center items-center py-3"
	>
		<button
			bind:this={submit}
			type="submit"
			class="border-2 border-black rounded-xl font-semibold mx-auto py-3 w-40 hover:opacity-80"
			class:bg-black={loading}
		>
			{#if loading}
				<Spinner />
			{:else}
				<div class="my-auto">Save Settings</div>
			{/if}
		</button>
	</div>
</form>
