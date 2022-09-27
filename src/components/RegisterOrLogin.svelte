<script>
	import { page } from '$app/stores';
	import { tick } from 'svelte';
	import { Icon } from '$comp';
	import { post, failure } from '$lib/utils';
	import { redirect, user, token } from '$lib/store';
	import { auth } from '$lib/socket';
	import { goto } from '$app/navigation';
	import { t } from '$lib/translations';

	export let pageID;

	let username,
		password,
		email,
		twofa = '';

	let revealPassword = false;

	let action = {
		register: '/register',
		signIn: '/login'
	}[pageID];

	$: if ($user) goto(`/${username}/receive`);

	let focus = (el) => setTimeout(() => el.focus());
</script>

<div class="pt-10">
	<div class="w-[243px] mx-auto mb-10">
		<a href="/">
			<Icon icon="logo" />
		</a>
	</div>

	<div class="flex justify-center items-center">
		<div class="shadow-xl rounded-3xl p-10 pb-12 space-y-5 w-full mx-5 md:mx-0 md:w-[400px]">
			<h1 class="text-2xl font-bold text-center">{$t('login.' + pageID)}</h1>

			<form class="space-y-5" {action} method="POST">
				{#if $redirect}
					<input type="hidden" name="redirect" value={$redirect} />
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
					/>
				</div>

				<div class="relative">
					<label for="password" class="block font-semibold">{$t('login.password')}</label>
					{#if revealPassword}
						<input name="password" type="text" required class="bg-primary" bind:value={password} />
					{:else}
						<input
							name="password"
							type="password"
							required
							class="bg-primary"
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

				{#if pageID === 'signIn'}
					<div>
						<label for="token" class="font-semibold"
							>{$t('login.token')}
							<span class="text-secondary">({$t('login.optional')})</span></label
						>
						<input name="token" type="text" class="bg-primary" bind:value={twofa} />
					</div>
				{/if}

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
		</div>
	</div>
</div>
