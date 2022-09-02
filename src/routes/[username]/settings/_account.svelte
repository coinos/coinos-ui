<script>
	import { tick } from 'svelte';
	import { user, colorTheme, rates } from '$lib/store';
	import { Icon, Toggle, LocaleSelector } from '$comp';
	import { t } from '$lib/translations';
	import { upload } from '$lib/upload';

	let selectedTheme = 1;
	let revealPassword = false;
	let password;
	let profileFile;
	let selectFile = () => profileFile.click();

	let colorThemes = [
		{ theme: 1, color1: 'from-[#F5F7FA]', color2: 'to-[#C3CFE2]' },
		{ theme: 2, color1: 'from-[#FDFCFB]', color2: 'to-[#E2D1C3]' },
		{ theme: 3, color1: 'from-[#E6E9F0]', color2: 'to-[#EEF1F5]' },
		{ theme: 4, color1: 'from-[#D5D4D0]', color2: 'to-[#EEEEEC]' },
		{ theme: 5, color1: 'from-[#F3E7E9]', color2: 'to-[#E3EEFF]' },
		{ theme: 6, color1: 'from-[#F5F7FA]', color2: 'via-[#EAF2FF] to-[#DEDFFF]' }
	];

	let handleThemeClick = (colors) => {
		selectedTheme = colors.theme;
		$colorTheme = colors.color1 + ' ' + colors.color2;
	};

	let percent;
	let progress = async (event) => {
		percent = Math.round((event.loaded / event.total) * 100);
	};
	let handleFile = async ({ target: { files } }) => {
    let file = files[0];
    file.filename = "squirt";
		let filename = await upload(file, progress);
	};

	$: $user.password = $user.confirm = password;
</script>

<div>
	<label for="language" class="font-bold block mb-1">{$t('user.settings.locale')}</label>
	<LocaleSelector style="block py-3 w-full" />
</div>

<div>
	<label for="email" class="font-bold mb-1 block">{$t('user.settings.email')}</label>
	<input type="email" name="email" bind:value={$user.email} />
</div>

<div>
	<label for="username" class="font-bold mb-1 block">{$t('user.settings.username')}</label>
	<input type="text" name="username" bind:value={$user.username} />
</div>

<div class="relative">
	<label for="password" class="block font-bold block mb-1">{$t('user.settings.newPassword')}</label>
	{#if revealPassword}
		<input type="text" bind:value={password} />
	{:else}
		<input type="password" bind:value={password} />
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
	<input type="text" name="address" bind:value={$user.address} />
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
	<div class="flex justify-between items-center">
		<span class="font-bold">{$t('user.settings.profileImage')}</span>
	</div>

	<div class="flex">
		<div
			class="rounded-full border-4 border-white p-4 bg-gradient-to-r {$colorTheme} w-24 h-24 my-auto"
		>
			<Icon icon="logo-symbol-white" style="mx-auto" />
		</div>
		<div class="ml-2 border border-dashed border-2 p-2 border-white hover:border-secondary w-full">
			<button
				type="button"
				class="border rounded-2xl font-bold w-24 text-center px-0 py-2 hover:bg-primary"
				on:click={selectFile}>Select</button
			>
			<input type="file" class="hidden" bind:this={profileFile} on:change={handleFile} />
			<div class="mt-2 text-sm">gumbo.jpg</div>
		</div>
	</div>
</div>

<div>
	<div class="flex justify-between items-center">
		<span class="font-bold">{$t('user.settings.bannerImage')}</span>
	</div>
	<p class="text-secondary mb-4">Recommended size: 1920x540px</p>
	<div class="bg-gradient-to-r {$colorTheme} w-full h-48 mb-4" />
	<button
		type="button"
		class="border rounded-2xl font-bold w-24 text-center px-0 py-2 hover:bg-primary">Select</button
	>
	<div class="mt-2 text-sm">gumbo.jpg</div>
</div>

<div>
	<span class="font-bold mb-1 block">{$t('user.settings.theme')}</span>
	<p class="text-secondary mb-1">{$t('user.settings.themeDescription')}</p>
	{#each colorThemes as colors}
		<button
			type="button"
			class="mr-2 w-10 h-10 bg-gradient-to-r {colors.color1} {colors.color2} rounded-xl border-2 {selectedTheme ===
			colors.theme
				? 'border-black'
				: ''}"
			on:click={() => handleThemeClick(colors)}
		/>
	{/each}
</div>
