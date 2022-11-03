<script>
	import { enhance } from '$app/forms';
	import { scale } from 'svelte/transition';
	import { Icon } from '$comp';
	import { t } from '$lib/translations';

	export let data, form;

	let { user } = data;
	let email;
	let message;
</script>

<div class="container px-4 max-w-lg mx-auto mt-20">
	{#if form?.success}
		<h1 class="text-center text-3xl md:text-4xl font-semibold mb-8">Thank you!</h1>
		<p class="text-center mb-8">Someone will be in touch shortly.</p>

		<a href={`/${user.username}/dashboard`}>
			<button class="rounded-full border py-2 px-5 font-bold hover:opacity-80 w-full mb-2"
				>Done</button
			>
		</a>
	{:else}
		<h1 class="text-center text-3xl md:text-4xl font-semibold mb-8">
			{$t('user.support.header')}
		</h1>
		<form method="POST" use:enhance>
			<div class="mb-4">
				<label for="account" class="font-semibold">{$t('user.support.accountName')}</label>
				<input
					class="block border rounded-xl p-2 w-full"
					type="text"
					name="account"
					required
					disabled
					value={user.username}
				/>
			</div>

			<div class="mb-4">
				<label for="email" class="font-semibold">{$t('user.support.email')}</label>
				<input
					class="block border rounded-xl p-2 w-full"
					type="email"
					name="email"
					bind:value={email}
					required
				/>
			</div>

			<div class="mb-4">
				<label for="message" class="font-semibold">{$t('user.support.message')}</label>
				<textarea
					rows={5}
					class="block border rounded-xl p-2 w-full"
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
