<script>
	import { tick } from 'svelte';
	import { Pincode, PincodeInput } from 'svelte-pincode';
	import { fly } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { Icon } from '$comp';
	import { focus } from '$lib/utils';
	import { loginRedirect, password } from '$lib/store';
	import { t } from '$lib/translations';
	import { page } from '$app/stores';

	let token, tokenInput;
	let code = [];
	let redirect;

	$: need2fa = form?.message === '2fa';
	$: if (need2fa) tokenInput && tick().then(tokenInput.focusFirstInput);

	export let form;
	export let pageID;

	let username, email, btn;

	$: update(form);
	let update = (form) => form && ({ username, password: $password } = form);

	$: token && token?.length === 6 && tick().then(() => btn.click());

	let revealPassword = false;

	let action = {
		register: '/register',
		signIn: '/login'
	}[pageID];
</script>

<div class="pt-10">
	<div class="w-[243px] mx-auto mb-10">
		<a href="/">
			<Icon icon="logo" />
		</a>
	</div>

	<div class="flex justify-center items-center">
		<div class="shadow-xl rounded-3xl p-10 pb-12 space-y-5 w-full mx-5 md:mx-0 md:w-[400px]">
			{#if need2fa}
				<h1 class="text-2xl font-bold text-center">Enter 2FA Code</h1>

				{#if form?.token}
					<div class="text-red-600 text-center" in:fly>Invalid token, try again</div>
				{/if}

				<form class="space-y-5" {action} method="POST" use:enhance>
					<input type="hidden" name="username" value={username} />
					<input type="hidden" name="password" value={$password} />
					<input type="hidden" name="token" value={token} />

					<div>
						<Pincode bind:code bind:value={token} bind:this={tokenInput}>
							<PincodeInput />
							<PincodeInput />
							<PincodeInput />
							<PincodeInput />
							<PincodeInput />
							<PincodeInput />
						</Pincode>
					</div>
					<button
						bind:this={btn}
						type="submit"
						class="bg-black text-white w-full rounded-2xl p-4 font-semibold hover:opacity-80"
						>{$t('login.' + pageID)}
					</button>
				</form>
			{:else}
				<h1 class="text-2xl font-bold text-center">{$t('login.' + pageID)}</h1>

				{#if form?.error}
					<div class="text-red-600 text-center" in:fly>
						{form.error}
					</div>
				{/if}

				<form class="space-y-5" {action} method="POST" use:enhance>
					{#if $loginRedirect}
						<input type="hidden" name="loginRedirect" value={$loginRedirect} />
					{/if}

					<div>
						<label for="username" class="font-semibold">{$t('login.username')}</label>
						<input
							name="username"
							type="text"
							required
							class="bg-primary"
							bind:value={username}
							use:focus
							autocapitalize="none"
						/>
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
							{$t('login.passwordRecommendation')}
						</p>
					{:else}
						<!-- TODO -->
						<!-- <div class="flex justify-end items-center"> -->
						<!-- 	<a href="/forgot" class="underline underline-offset-4 text-black text-sm" -->
						<!-- 		>{$t('login.forgotUserOrPassword')}</a -->
						<!-- 	> -->
						<!-- </div> -->
					{/if}

					<button
						type="submit"
						class="bg-black text-white w-full rounded-2xl p-4 font-semibold hover:opacity-80"
						>{$t('login.' + pageID)}
					</button>
				</form>

				<p class="text-secondary text-center font-medium">
					{pageID === 'register' ? $t('login.haveAccount') : $t('login.noAccount')}
					<a
						href={pageID === 'register' ? '/login' : '/register'}
						class="block md:inline text-black underline underline-offset-4 hover:opacity-80"
					>
						{pageID === 'register' ? $t('login.signIn') : $t('login.register')}
					</a>
				</p>
			{/if}
		</div>
	</div>
</div>
