<script>
	import { AppHeader, Icon, Toggle, LocaleSelector } from '$comp';
	import { user, colorTheme } from '$lib/store';

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
		<h1 class="text-center text-3xl md:text-4xl font-semibold mb-10">Settings</h1>

		<div class="font-bold flex justify-between items-center border-b pb-3 text-secondary">
			<button class:selected={setting === 'account'} on:click={() => (setting = 'account')}
				>ACCOUNT</button
			>

			<button class:selected={setting === 'pos'} on:click={() => (setting = 'pos')}
				>POINT OF SALE</button
			>

			<button class:selected={setting === 'security'} on:click={() => (setting = 'security')}
				>SECURITY</button
			>
		</div>

		{#if setting === 'account'}
		<div>
      <label for="language" class="font-bold block mb-1">Language</label>
  <LocaleSelector style='block py-3 w-full'/>
    </div>

			<div>
				<label for="username" class="font-bold mb-1 block">Username</label>
				<input
					type="text"
					disabled
					name="username"
					value={$user.username}
					class="block border rounded-xl p-3 w-full"
				/>
			</div>

			<div class="relative">
				<label for="password" class="block font-bold block mb-1">New Password</label>
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
				<label for="address" class="font-bold mb-1 block">Business Address</label>
				<input type="text" name="address" class="block border rounded-xl p-3 w-full" />
			</div>

			<div>
				<div class="flex justify-between items-center">
					<span class="font-bold">Email Notifications</span>
					<Toggle id="email-notify" />
				</div>
				<p class="text-secondary mt-1 w-9/12">
					Get notified via email when a change occurs on your account or when people send you
					payments.
				</p>
			</div>

			<div>
				<div class="flex justify-between items-center">
					<span class="font-bold">SMS Notifications</span>
					<Toggle id="sms-notify" />
				</div>
				<p class="text-secondary mt-1 w-9/12">
					CoinOS will send you text notifications when this is enabled.
				</p>
			</div>

			<div>
				<span class="font-bold mb-1 block">Color Theme</span>
				<p class="text-secondary mb-1">Select from the default color themes.</p>
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
				<label for="currency" class="font-bold block mb-1">Local Currency</label>
				<select name="currency" class="block py-3 w-full">
					<option value="USD">USD</option>
				</select>
			</div>

			<div>
				<label for="btc-unit" class="font-bold block mb-1">Display bitcoin in:</label>
				<select disabled name="btc-unit" class="block py-3 w-full">
					<option value="SATS">Satoshi (SATS)</option>
					<option value="BTC">Bitcoin (BTC)</option>
				</select>
			</div>
		{:else}
			<div>
				<span class="font-bold mb-1">Security Pin</span>
				<p class="text-secondary mb-1">
					Set a security pin that will be used to unlock your settings and to send outgoing
					payments.
				</p>
				<button class="p-3 border rounded-3xl font-bold flex justify-center items-center"
					><Icon icon="lock" style="mr-1" /> Set Pin</button
				>
			</div>

			<div>
				<label for="auto-lock" class="font-bold mb-1">Auto-Lock Timer</label>
				<p class="text-secondary mb-1">
					Your account will go into a secure mode automatically after a specified time:
				</p>
				<select name="auto-lock" class="block py-3 w-full">
					<option value="5">5 min</option>
					<option value="10">10 min</option>
					<option value="30">30 min</option>
					<option value="60">1 hour</option>
					<option value="480">8 hours</option>
				</select>
			</div>

			<div>
				<span class="font-bold mb-1">2-Factor Authentication</span>
				<p class="text-secondary mb-1">
					Add an extra level of security to your device by enableing 2-factor authentication.
				</p>
				<button class="p-3 border rounded-3xl font-bold flex justify-center items-center"
					><Icon icon="mobile" style="mr-1" /> Set up 2FA</button
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
