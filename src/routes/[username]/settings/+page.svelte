<script>
	import { AppHeader, Icon, Toggle, LocaleSelector } from '$comp';
	import { user, colorTheme } from '$lib/store';
  import { _ } from 'svelte-i18n';

	let setting = 'account';
	let password;
	let revealPassword = false;

	const colorThemes = [
		{ theme: 1, color1: 'from-[#F5F7FA]', color2: 'to-[#C3CFE2]' },
		{ theme: 2, color1: 'from-[#FDFCFB]', color2: 'to-[#E2D1C3]' },
		{ theme: 3, color1: 'from-[#E6E9F0]', color2: 'to-[#EEF1F5]' },
		{ theme: 4, color1: 'from-[#D5D4D0]', color2: 'to-[#EEEEEC]' },
		{ theme: 5, color1: 'from-[#F3E7E9]', color2: 'to-[#E3EEFF]' },
		{ theme: 6, color1: 'from-[#F5F7FA]', color2: 'via-[#EAF2FF] to-[#DEDFFF]' }
	];
	// need to update this to use the new backend field
	let selectedTheme = 1;

	const handleThemeClick = (colors) => {
		selectedTheme = colors.theme;
		$colorTheme = colors.color1 + ' ' + colors.color2;
	};
</script>

{#if $user}
	<AppHeader />

	<div class="my-20 px-3 md:px-0 w-full md:w-[400px] mx-auto space-y-8">
		<h1 class="text-center text-3xl md:text-4xl font-semibold mb-10">{$_('user.settings.header')}</h1>

		<div class="font-bold flex justify-between items-center border-b pb-3 text-secondary">
			<button class:selected={setting === 'account'} on:click={() => (setting = 'account')}
				>{$_('user.settings.ACCOUNT')}</button
			>

			<button class:selected={setting === 'pos'} on:click={() => (setting = 'pos')}
				>{$_('user.settings.POINT_OF_SALE')}</button
			>

			<button class:selected={setting === 'security'} on:click={() => (setting = 'security')}
				>{$_('user.settings.SECURITY')}</button
			>
		</div>

		{#if setting === 'account'}
			<div>
				<label for="language" class="font-bold block mb-1">{$_('user.settings.locale')}</label>
				<LocaleSelector style="block py-3 w-full" />
			</div>

			<div>
				<label for="username" class="font-bold mb-1 block">{$_('user.settings.username')}</label>
				<input
					type="text"
					disabled
					name="username"
					value={$user.username}
					class="block border rounded-xl p-3 w-full"
				/>
			</div>

			<div class="relative">
				<label for="password" class="block font-bold block mb-1">{$_('user.settings.newPassword')}</label>
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
				<label for="address" class="font-bold mb-1 block">{$_('user.settings.businessAddress')}</label>
				<input type="text" name="address" class="block border rounded-xl p-3 w-full" />
			</div>

			<div>
				<div class="flex justify-between items-center">
					<span class="font-bold">{$_('user.settings.emailNotifications')}</span>
					<Toggle id="email-notify" />
				</div>
				<p class="text-secondary mt-1 w-9/12">
          {$_('user.settings.emailNotificationsDescription')}
				</p>
			</div>

			<div>
				<div class="flex justify-between items-center">
					<span class="font-bold">{$_('user.settings.smsNotifications')}</span>
					<Toggle id="sms-notify" />
				</div>
				<p class="text-secondary mt-1 w-9/12">
					{$_('user.settings.smsNotificationsDescription')}
				</p>
			</div>

			<div>
				<span class="font-bold mb-1 block">{$_('user.settings.theme')}</span>
				<p class="text-secondary mb-1">{$_('user.settings.themeDescription')}</p>
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
		{:else if setting === 'pos'}
			<div>
				<label for="currency" class="font-bold block mb-1">{$_('user.settings.localCurrency')}</label>
				<select name="currency" class="block py-3 w-full">
					<option value="USD">USD</option>
				</select>
			</div>

			<div>
				<label for="btc-unit" class="font-bold block mb-1">{$_('user.settings.btcUnit')}</label>
				<select disabled name="btc-unit" class="block py-3 w-full">
					<option value="SATS">{$_('user.settings.satoshis')} (SAT)</option>
					<option value="BTC">{$_('user.settings.bitcoin')} (BTC)</option>
				</select>
			</div>
		{:else}
			<div>
				<span class="font-bold mb-1">{$_('user.settings.securityPIN')}</span>
				<p class="text-secondary mb-1">
					{$_('user.settings.securityPINDescription')}
				</p>
				<button class="p-3 border rounded-3xl font-bold flex justify-center items-center"
					><Icon icon="lock" style="mr-1" /> {$_('user.settings.setPIN')}</button
				>
			</div>

			<div>
				<label for="auto-lock" class="font-bold mb-1">{$_('user.settings.autoLock')}</label>
				<p class="text-secondary mb-1">
					{$_('user.settings.autoLockDescription')}
				</p>
				<select name="auto-lock" class="block py-3 w-full">
					<option value="5">5 min</option>
					<option value="10">10 min</option>
					<option value="30">30 min</option>
					<option value="60">1 h</option>
					<option value="480">8 h</option>
				</select>
			</div>

			<div>
				<span class="font-bold mb-1">{$_('user.settings.twofa')}</span>
				<p class="text-secondary mb-1">
					{$_('user.settings.twofaDescription')}
				</p>
				<button class="p-3 border rounded-3xl font-bold flex justify-center items-center"
					><Icon icon="mobile" style="mr-1" /> {$_('user.settings.twofaSetup')}</button
				>
			</div>
		{/if}
	</div>
{/if}

<style>
	.selected {
		color: black;
	}
</style>
