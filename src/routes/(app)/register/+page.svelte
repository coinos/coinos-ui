<script>
	import punks from '$lib/punks';
	import { upload } from '$lib/upload';
	import { afterNavigate, invalidateAll } from '$app/navigation';
	import { applyAction, deserialize } from '$app/forms';
	import { tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { Pin, Icon, Spinner } from '$comp';
	import { focus, fail } from '$lib/utils';
	import { avatar, password, loginRedirect } from '$lib/store';
	import { t } from '$lib/translations';
	import { page } from '$app/stores';
	import { generate } from '$lib/nostr';

	export let form;
	export let data;

	$: data && ($avatar = undefined);

	let cleared;
	let clear = () => {
		if (!cleared) {
			cleared = true;
			username = '';
			$password = '';
			revealPassword = false;
		}
	};

	let refresh = async () => {
		await invalidateAll();
		await tick();
		username = data.username;
		$password = data.password;
	};

	let username = data.username;
	$password = data.password;

	let { index } = data;

	afterNavigate(async () => {
		try {
			await invalidateAll();
		} catch (e) {
			console.log(e);
		}
	});

	let token, formElement;
	let code = [];
	let redirect;

	$: need2fa = form?.message === '2fa';
	let cancel = () => (need2fa = false);
	$: if (form?.message === '2fa' && form.token === token) token = '';

	let email, btn;

	$: update(form);
	let update = (form) => form && ({ username, password: $password } = form);

	$: token && token?.length === 6 && tick().then(() => btn.click());

	let revealPassword = true;

	let loading;
	async function handleSubmit(e) {
		loading = true;

		let data = new FormData(this);
		let user = Object.fromEntries(data);
		await generate(user);

		for (let k in user) {
			data.set(k, user[k]);
		}

		data.set('profile', punks[index]);
		if ($avatar) {
			try {
				let { hash } = JSON.parse(
					await upload($avatar.file, $avatar.type, $avatar.progress, token)
				);

				data.set('profile', hash);
				await fetch(`/api/public/${hash}.webp`, { cache: 'reload', mode: 'no-cors' });
			} catch (e) {
				console.log('problem uploading avatar', e);
			}
		}

		const response = await fetch('/register', {
			method: 'POST',
			body: data
		});

		const result = deserialize(await response.text());

		if (result.type === 'success') {
			await invalidateAll();
		}

		applyAction(result);
		loading = false;
	}

	let avatarInput;
	$: src = `/api/public/${punks[index]}.webp`;
	let decr = () => (index = index <= 0 ? 63 : index - 1);
	let incr = () => (index = index >= 63 ? 0 : index + 1);
	let selectAvatar = () => avatarInput.click();

	let progress;
	let handleFile = async ({ target }) => {
		let type = 'profile';
		let file = target.files[0];
		if (!file) return;

		if (file.size > 10000000) form.error = 'File too large';
		$avatar = { file, type, progress };

		var reader = new FileReader();
		reader.onload = async (e) => {
			src = e.target.result;
		};

		reader.readAsDataURL(file);
	};
</script>

{#if need2fa}
	<Pin bind:value={token} title="Enter 2FA Code" {cancel} notify={false} />
{/if}

<div class="pt-4">
	<div class="w-[243px] mx-auto">
		<a href="/">
			<Icon icon="logo" />
		</a>
	</div>

	<div class="flex justify-center items-center">
		<div class="shadow-xl rounded-3xl p-4 pt-0 space-y-5 w-full mx-5 md:mx-0 md:w-[400px]">
			<input
				type="file"
				class="hidden"
				bind:this={avatarInput}
				on:change={(e) => handleFile(e, 'profile')}
			/>

			<div class="relative">
				<button class="absolute w-8 h-12 left-12 bg-white rounded top-12" on:click={decr}>
					<Icon icon="chevron-left" style="w-8 " />
				</button>
				<div class="relative w-32 mx-auto" on:click={selectAvatar}>
					<button
						class="w-32 h-32 rounded-full border-4 border-white overflow-hidden flex mx-auto relative"
					>
						<img
							{src}
							class="w-full h-full object-cover object-center overflow-hidden"
							alt={username}
						/>
					</button>
					<button
						class="absolute bg-white rounded-full p-2 mx-auto right-0 bottom-0 z-10 bg-opacity-80"
					>
						<Icon icon="upload" style="w-8" />
					</button>
				</div>
				<button class="absolute w-8 h-12 right-12 bg-white rounded top-12" on:click={incr}>
					<Icon icon="chevron-left" style="w-8 rotate-180" />
				</button>
			</div>

			{#if form?.error}
				<div class="text-red-600 text-center" in:fly>
					{form.error}
				</div>
			{/if}

			<form class="space-y-5" on:submit|preventDefault={handleSubmit} method="POST">
				<input
					type="hidden"
					name="loginRedirect"
					value={$loginRedirect || $page.url.searchParams.get('redirect')}
				/>
				<input type="hidden" name="token" value={token} />

				<div class="relative">
					<label for="username" class="font-semibold">{$t('login.username')}</label>
					<input
						name="username"
						type="text"
						required
						class="bg-primary"
						bind:value={username}
						on:focus={clear}
						autocapitalize="none"
					/>
					<button type="button" on:click={refresh} class="absolute right-5 top-10">
						<Icon icon="refresh" style="w-6" />
					</button>
				</div>

				<div class="relative">
					<label for="password" class="block font-semibold">{$t('login.password')}</label>
					{#if revealPassword}
						<input
							name="password"
							type="text"
							required
							class="bg-primary"
							bind:value={$password}
							autocapitalize="none"
						/>
					{:else}
						<input
							name="password"
							type="password"
							required
							class="bg-primary"
							bind:value={$password}
							autocapitalize="none"
							on:focus={clear}
						/>
					{/if}
					<button
						type="button"
						on:click={() => (revealPassword = !revealPassword)}
						class="absolute right-5 top-10"
					>
						<Icon icon={revealPassword ? 'eye' : 'eye-off'} />
					</button>
				</div>

				<p class="text-secondary text-sm">
					{$t('login.passwordRecommendation')}
				</p>

				<button
					type="submit"
					class="bg-black text-white w-full rounded-2xl p-4 font-semibold hover:opacity-80"
					disabled={loading}
					bind:this={btn}
				>
					{#if loading}
						<Spinner />
					{:else}
						{$t('login.register')}
					{/if}
				</button>
			</form>

			<p class="text-secondary text-center font-medium">
				{$t('login.haveAccount')}
				<a
					href={'/login'}
					class="block md:inline text-black underline underline-offset-4 hover:opacity-80"
				>
					{$t('login.signIn')}
				</a>
			</p>
		</div>
	</div>
</div>
