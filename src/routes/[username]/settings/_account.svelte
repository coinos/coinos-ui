<svelte:options accessors={true} />

<script>
	import { user, colorTheme, rates } from '$lib/store';
	import { Icon, Toggle, LocaleSelector } from '$comp';
	import { t } from '$lib/translations';

	let password;
	let selectedTheme = 1;
	let revealPassword = false;

	const colorThemes = [
		{ theme: 1, color1: 'from-[#F5F7FA]', color2: 'to-[#C3CFE2]' },
		{ theme: 2, color1: 'from-[#FDFCFB]', color2: 'to-[#E2D1C3]' },
		{ theme: 3, color1: 'from-[#E6E9F0]', color2: 'to-[#EEF1F5]' },
		{ theme: 4, color1: 'from-[#D5D4D0]', color2: 'to-[#EEEEEC]' },
		{ theme: 5, color1: 'from-[#F3E7E9]', color2: 'to-[#E3EEFF]' },
		{ theme: 6, color1: 'from-[#F5F7FA]', color2: 'via-[#EAF2FF] to-[#DEDFFF]' }
	];
</script>

<div>
	<label for="language" class="font-bold block mb-1">{$t('user.settings.locale')}</label>
	<LocaleSelector style="block py-3 w-full" />
</div>

<div>
	<label for="email" class="font-bold mb-1 block">{$t('user.settings.email')}</label>
	<input type="email" disabled name="email" class="block border rounded-xl p-3 w-full" />
</div>

<div>
	<label for="username" class="font-bold mb-1 block">{$t('user.settings.username')}</label>
	<input
		type="text"
		disabled
		name="username"
		value={$user.username}
		class="block border rounded-xl p-3 w-full"
	/>
</div>

<div class="relative">
	<label for="password" class="block font-bold block mb-1">{$t('user.settings.newPassword')}</label>
	{#if revealPassword}
		<input type="text" class="block border rounded-xl p-3 w-full" bind:value={password} />
	{:else}
		<input type="password" class="block border rounded-xl p-3 w-full" bind:value={password} />
	{/if}
	<button
		type="button"
		on:click={() => (revealPassword = !revealPassword)}
		class="absolute right-5 top-10"
	>
		<Icon icon={revealPassword ? 'eye' : 'eye-off'} />
	</button>
</div>

<div>
	<label for="address" class="font-bold mb-1 block">{$t('user.settings.businessAddress')}</label>
	<input type="text" name="address" class="block border rounded-xl p-3 w-full" />
</div>

<div>
	<div class="flex justify-between items-center">
		<span class="font-bold">{$t('user.settings.emailNotifications')}</span>
		<Toggle id="email-notify" />
	</div>
	<p class="text-secondary mt-1 w-9/12">
		{$t('user.settings.emailNotificationsDescription')}
	</p>
</div>

<div>
	<div class="flex justify-between items-center">
		<span class="font-bold">{$t('user.settings.smsNotifications')}</span>
		<Toggle id="sms-notify" />
	</div>
	<p class="text-secondary mt-1 w-9/12">
		{$t('user.settings.smsNotificationsDescription')}
	</p>
</div>

<div>
	<span class="font-bold mb-1 block">{$t('user.settings.theme')}</span>
	<p class="text-secondary mb-1">{$t('user.settings.themeDescription')}</p>
	{#each colorThemes as colors}
		<button
			class="mr-2 w-10 h-10 bg-gradient-to-r {colors.color1} {colors.color2} rounded-xl border-2 {selectedTheme ===
			colors.theme
				? 'border-black'
				: ''}"
			on:click={() => handleThemeClick(colors)}
		/>
	{/each}
</div>
