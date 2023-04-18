<script>
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { applyAction, deserialize } from '$app/forms';

	import { Icon, Spinner, Pin } from '$comp';
	import { t } from '$lib/translations';
	import { fail, post, warning, success } from '$lib/utils';
	import { avatar, banner, password, pin } from '$lib/store';
	import { upload } from '$lib/upload';
	import { page } from '$app/stores';
	import { sign, send, reEncryptEntropy } from '$lib/nostr';
	import { invalidateAll } from '$app/navigation';

	import Account from './_account.svelte';
	import Pos from './_pos.svelte';
	import Security from './_security.svelte';

	import { PUBLIC_COINOS_URL } from '$env/static/public';

	export let data;
	export let form;

	let submit;
	let formElement;

	let { user, token, rates, tab } = data;

	$: update(data);
	let update = () => ({ user, token, rates, tab } = data);

	$: form?.user && ({ user } = form);

	$: form?.success && success('Settings saved!');

  $: form?.message && fail(form.message);

	$: if (form?.message?.startsWith('Pin')) {
		fail('Wrong pin, try again');
		$pin = '';
	}

	let tabs = [
		{ name: 'account', key: 'ACCOUNT', comp: Account },
		{ name: 'pos', key: 'POINT_OF_SALE', comp: Pos },
		{ name: 'security', key: 'SECURITY', comp: Security }
	];

	$: ({ comp } = tabs.find((t) => t.name === tab));

	let { address, id, username } = user;
	let loading;

	async function handleSubmit() {
		try {
			loading = true;
			let data = new FormData(formElement);

			if (data.get('password')) {
				try {
					data.set('cipher', await reEncryptEntropy(user, data.get('password')));
				} catch (e) {
					console.log('Failed to encrypt keys with new password');
					throw e;
				}
			}

			if ($avatar) {
				await upload($avatar.file, $avatar.type, $avatar.progress, token);
				await fetch(`/api/public/${id}-profile.webp`, { cache: 'reload', mode: 'no-cors' });
			}

			if ($banner) {
				await upload($banner.file, $banner.type, $banner.progress, token);
				await fetch(`/api/public/${id}-banner.webp`, { cache: 'reload', mode: 'no-cors' });
			}

			let event = {
				pubkey: user.pubkey,
				created_at: Math.floor(Date.now() / 1000),
				kind: 0,
				content: JSON.stringify({
					name: user.username,
					about: user.address,
					picture: `${PUBLIC_COINOS_URL}/public/${user.id}-profile.webp`
				}),
				tags: []
			};

			try {
				await sign({ event, user });
				await send(event);
			} catch (e) {
				warning('nostr profile could not be updated');
			}

			const response = await fetch(formElement.action, {
				method: 'POST',
				body: data
			});

			const result = deserialize(await response.text());

			if (result.type === 'success') {
				await invalidateAll();
				if (data.get('password')) $password = data.get('password');
			}

			applyAction(result);
		} catch (e) {
			console.log(e);
			fail('Something went wrong');
		}

		loading = false;
	}
</script>

{#if user.haspin && $pin?.length !== 6}
	<Pin />
{/if}

<form
	method="POST"
	class="mb-[154px]"
	on:submit|preventDefault={handleSubmit}
	bind:this={formElement}
>
	<input type="hidden" name="pin" value={$pin} />

	<div class="mt-24 mb-20 px-3 md:px-0 w-full md:w-[400px] mx-auto space-y-8">
		<h1 class="text-center text-3xl md:text-4xl font-semibold mb-10">
			{$t('user.settings.header')}
		</h1>

		<div class="font-bold flex justify-around items-center border-b pb-3 text-secondary">
			{#each tabs as { name, key }}
				<a href={`/${user.username}/settings/${name}`}>
					<button class="hover:opacity-80" class:text-black={tab === name}
						>{$t(`user.settings.${key}`)}</button
					>
				</a>
			{/each}
		</div>

		<svelte:component this={comp} {user} {rates} {submit} />
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
				<div class="my-auto">{$t('user.settings.saveSettings')}</div>
			{/if}
		</button>
	</div>
</form>
