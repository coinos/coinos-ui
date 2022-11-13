<script>
	import { enhance } from '$app/forms';
	import { scale } from 'svelte/transition';
	import { AppHeader, Icon } from '$comp';
	import { t } from '$lib/translations';

	export let data, form;

	let { user } = data;
	$: if (user) {
		data.subject = { ...user };
	}

	let email;
	let message;
</script>

{#if user}
	<AppHeader {data} />
{/if}

{#if form?.error}
	<div class="text-red-600 text-center">
		{form.error}
	</div>
{/if}

<div class="container px-4 max-w-lg mx-auto mt-20 space-y-5">
	{#if form?.success}
		<h1 class="text-center text-3xl md:text-4xl font-semibold mb-8">Thank you!</h1>
		<p class="text-center mb-8">Someone will be in touch shortly.</p>

		<a href={user ? `/${user.username}/dashboard` : '/'}>
			<button class="rounded-full border py-2 px-5 font-bold hover:opacity-80 w-full mb-2"
				>Done</button
			>
		</a>
	{:else}
		<h1 class="text-center text-3xl md:text-4xl font-semibold mb-8">
			{$t('user.support.header')}
		</h1>

		<p class="text-secondary">
			Fill out this form or email us directly at <a
				class="underline"
				href="mailto:support@coinos.io">support@coinos.io</a
			> and we'll do our best to get back to you in a timely manner.
		</p>

		<form method="POST" use:enhance>
			<div class="mb-4">
				<label for="account" class="font-semibold">{$t('user.support.accountName')}</label>
				<input
					class="bg-primary"
					type="text"
					name="account"
					required
					value={user?.username || ''}
				/>
			</div>

			<div class="mb-4">
				<label for="email" class="font-semibold">{$t('user.support.email')}</label>
				<input class="bg-primary" type="email" name="email" bind:value={email} required />
			</div>

			<div class="mb-4">
				<label for="message" class="font-semibold">{$t('user.support.message')}</label>
				<textarea
					rows={5}
					class="bg-primary"
					type="text"
					name="message"
					bind:value={message}
					required
				/>
			</div>

			<button
				type="submit"
				disabled={!email || !message}
				class="{!email || !message
					? 'opacity-50'
					: 'opacity-100'} bg-black text-white font-bold rounded-xl py-3 w-full mx-auto {email &&
				message
					? 'hover:opacity-80'
					: ''}">{$t('user.support.send')}</button
			>
		</form>
	{/if}
</div>
