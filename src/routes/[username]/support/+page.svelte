<script>
	import { t } from '$lib/translations';
	let email;
	let message;
</script>

<div class="mt-24 mb-20">
	<h1 class="text-center text-3xl md:text-4xl font-semibold mb-10">
		{$t('user.support.header')}
	</h1>

	<form class="space-y-5 mx-auto w-11/12 md:w-[350px]">
		<div>
			<label for="email" class="font-semibold">{$t('user.support.email')}</label>
			<input
				class="block border rounded-xl p-2 w-full"
				type="email"
				name="email"
				bind:value={email}
				required
			/>
		</div>

		<div>
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

		<div>
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
			disabled={!email || !message}
			class="{!email || !message
				? 'opacity-50'
				: 'opacity-100'} bg-black text-white font-bold rounded-xl py-3 w-full mx-auto {email &&
			message
				? 'hover:opacity-80'
				: ''}">{$t('user.support.send')}</button
		>
	</form>
</div>
