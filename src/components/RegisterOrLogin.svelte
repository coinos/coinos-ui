<script>
	import { Icon } from '$comp';
	import { post, failure } from '$lib/utils';
	import { user, token } from '$lib/store';
	import { auth } from '$lib/socket';
	import { goto } from '$app/navigation';
  import { _ } from 'svelte-i18n';

	export let pageID;

	let username = 'bob',
		password = 'pw';

	let revealPassword = false;

	let url = {
		register: '/register',
		signIn: '/login'
	}[pageID];

	let submit = async () => {
		try {
			let r = await post(url, { username, password });
			if (!r.token) r = await post('/login', { username, password });
			$token = r.token;
			auth();
		} catch (e) {
			if (!e.message) e.message = $_('login.failed');
			failure(e.message);
		}
	};

	$: if ($user) goto(`/${username}/receive`);
</script>

<div class="pt-10">
	<div class="w-[243px] mx-auto mb-10">
		<a href="/">
			<Icon icon="logo" />
		</a>
	</div>

	<div class="flex justify-center items-center">
		<div class="shadow-xl rounded-3xl p-10 pb-12 space-y-5 w-full mx-5 md:mx-0 md:w-[400px]">
			<h1 class="text-2xl font-bold text-center">{$_('login.' + pageID)}</h1>

			<form class="space-y-5" on:submit|preventDefault={submit}>
				<div>
					<label for="username" class="font-semibold">{$_('login.username')}</label>
					<!-- svelte-ignore a11y-autofocus -->
					<input
						type="text"
						required
						class="bg-primary p-4 rounded-2xl w-full"
						bind:value={username}
						autofocus
					/>
				</div>

				<div class="relative">
					<label for="password" class="block font-semibold">{$_('login.password')}</label>
					{#if revealPassword}
						<input
							type="text"
							required
							class="block bg-primary p-4 rounded-2xl w-full"
							bind:value={password}
						/>
					{:else}
						<input
							type="password"
							required
							class="block bg-primary p-4 rounded-2xl w-full"
							bind:value={password}
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

				{#if pageID === 'register'}
					<p class="text-secondary text-sm">
            {$_('login.passwordRecommendation')}
					</p>
				{:else}
					<div class="flex justify-end items-center">
						<a href="/forgot" class="underline underline-offset-4 text-black text-sm"
							>{$_('login.forgotPassword')}</a
						>
					</div>
				{/if}

				<button type="submit" class="bg-black text-white w-full rounded-2xl p-4 font-semibold"
					>{$_('login.' + pageID)}
				</button>
			</form>

			<p class="text-secondary text-center font-medium">
				{pageID === 'register' ? $_('login.haveAccount') : $_('login.noAccount')}
				<a
					href={pageID === 'register' ? '/login' : '/register'}
					class="block md:inline text-black underline underline-offset-4"
				>
					{pageID === 'register' ? $_('login.signIn') : $_('login.register')}
				</a>
			</p>
		</div>
	</div>
</div>
