<script>
	import { Icon } from '$comp';
	import { post } from '$lib/utils';
	import { user, token } from '$lib/store';
	import { auth } from '$lib/socket';
	import { goto } from '$app/navigation';

	export let page;

	let username = 'bob',
		password = 'pw';

	let revealPassword = false;

	let url = {
		Register: '/register',
		'Sign in': '/login'
	}[page];

	let submit = async () => {
		let r = await post(url, { username, password });
		if (!r.token) r = await post('/login', { username, password });
		$token = r.token;
		auth();
    user.subscribe(() => goto('/receive'));
	};
</script>

<div class="pt-10">
	<a href="/">
		<Icon icon="logo" style="mx-auto mb-10" />
	</a>

	<div class="flex justify-center items-center">
		<div class="shadow-xl rounded-3xl p-10 pb-12 space-y-5 w-full mx-5 md:mx-0 md:w-[400px]">
			<h1 class="text-2xl font-bold text-center">{page}</h1>

			<form class="space-y-5" on:submit|preventDefault={submit}>
				<div>
					<label for="username" class="font-semibold">Username</label>
					<input
						type="text"
						required
						class="bg-primary p-4 rounded-2xl w-full"
						bind:value={username}
						autofocus
					/>
				</div>

				<div class="relative">
					<label for="password" class="block font-semibold">Password</label>
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

				{#if page === 'Register'}
					<p class="text-secondary text-sm">
						We recommend a long, random password generated with a password manager.
					</p>
				{:else}
					<div class="flex justify-end items-center">
						<a href="/forgot" class="underline underline-offset-4 text-black text-sm"
							>Forgot Password?</a
						>
					</div>
				{/if}

				<button type="submit" class="bg-black text-white w-full rounded-2xl p-4 font-semibold"
					>{page}
				</button>
			</form>

			<p class="text-secondary text-center font-medium">
				{page === 'Register' ? 'Already have an account?' : "Don't have an account?"}
				<a
					href={page === 'Register' ? '/login' : '/register'}
					class="block md:inline text-black underline underline-offset-4"
				>
					{page === 'Register' ? 'Sign in' : 'Register'}
				</a>
			</p>
		</div>
	</div>
</div>
