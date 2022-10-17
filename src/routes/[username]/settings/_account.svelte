<script>
	import { tick } from 'svelte';
	import { colorTheme, tempProfileFiles, avatarUpload, bannerUpload } from '$lib/store';
	import { Icon, Toggle, LocaleSelector } from '$comp';
	import { t } from '$lib/translations';
	import { upload } from '$lib/upload';

	export let user;

	let selectedTheme = 1;
	let revealPassword = false;
	let password;
	let profileFile;
	let select = (type) => files[type].el.click();

	$: profile = files.profile.src;
	$: banner = files.banner.src;
	$: $tempProfileFiles = { profile: files.profile.src, banner: files.banner.src };

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

	let tooLarge = {};

	let files = { profile: {}, banner: {} };
	let handleFile = async ({ target }, type) => {
		tooLarge[type] = false;
		let file = target.files[0];
		console.log('TYPE', file.size);
		if (file.size > 5000000) return (tooLarge[type] = true);
		var reader = new FileReader();
		reader.onload = async (e) => {
			files[type].src = e.target.result;
		};
		reader.readAsDataURL(file);

		files[type].filename = file.name;
		if (type === 'profile') {
			$avatarUpload = { file, type, progress };
		} else if (type === 'banner') {
			$bannerUpload = { file, type, progress };
		}
	};

	$: user.password = user.confirm = password;
</script>

<div>
	<label for="language" class="font-bold block mb-1">{$t('user.settings.locale')}</label>
	<LocaleSelector style="select-styles block py-3 w-full" />
</div>

<!-- TODO
<div>
	<label for="email" class="font-bold mb-1 block">{$t('user.settings.email')}</label>
	<input type="email" name="email" bind:value={user.email} />
</div> -->

<!-- TODO fix breaking changes when user updates this field -->
<div>
	<label for="username" class="font-bold mb-1 block">{$t('user.settings.username')}</label>
	<input disabled type="text" name="username" bind:value={user.username} />
	<input type="hidden" name="username" bind:value={user.username} />
</div>

<div class="relative">
	<label for="password" class="block font-bold block mb-1">{$t('user.settings.newPassword')}</label>
	{#if revealPassword}
		<input name="password" type="text" bind:value={password} />
	{:else}
		<input name="password" type="password" bind:value={password} />
	{/if}
	<button
		type="button"
		on:click={() => (revealPassword = !revealPassword)}
		class="absolute right-5 top-11"
	>
		<Icon icon={revealPassword ? 'eye' : 'eye-off'} />
	</button>
</div>

<div>
	<label for="address" class="font-bold mb-1 block">{$t('user.settings.businessAddress')}</label>
	<input type="text" name="address" bind:value={user.address} />
</div>

<!-- TODO -->
<!-- <div> -->
<!-- 	<div class="flex justify-between items-center"> -->
<!-- 		<span class="font-bold">{$t('user.settings.emailNotifications')}</span> -->
<!-- 		<Toggle id="email-notify" /> -->
<!-- 	</div> -->
<!-- 	<p class="text-secondary mt-1 w-9/12"> -->
<!-- 		{$t('user.settings.emailNotificationsDescription')} -->
<!-- 	</p> -->
<!-- </div> -->
<!--  -->
<!-- <div> -->
<!-- 	<div class="flex justify-between items-center"> -->
<!-- 		<span class="font-bold">{$t('user.settings.smsNotifications')}</span> -->
<!-- 		<Toggle id="sms-notify" /> -->
<!-- 	</div> -->
<!-- 	<p class="text-secondary mt-1 w-9/12"> -->
<!-- 		{$t('user.settings.smsNotificationsDescription')} -->
<!-- 	</p> -->
<!-- </div> -->

<div>
	<span class="font-bold">{$t('user.settings.profileImage')}</span>

	<div class="flex">
		{#if profile}
			<div
				class="relative rounded-full overflow-hidden text-center w-20 h-20 my-auto hover:opacity-80 cursor-pointer"
				on:click={() => select('profile')}
			>
				<img
					src={profile}
					class="absolute w-full h-full object-cover object-center visible overflow-hidden"
					alt={user.username}
				/>
			</div>
		{:else if user.profile}
			<div
				class="relative rounded-full overflow-hidden text-center w-20 h-20 my-auto hover:opacity-80 cursor-pointer"
				on:click={() => select('profile')}
			>
				<img
					src={`/api/public/${user.username}-profile.webp`}
					class="absolute w-full h-full object-cover object-center visible overflow-hidden"
					alt={user.username}
				/>
			</div>
		{:else}
			<div
				class="rounded-full border-4 border-white p-4 bg-gradient-to-r {$colorTheme} w-24 my-auto hover:opacity-80 cursor-pointer"
				on:click={() => select('profile')}
			>
				<Icon icon="logo-symbol-white" style="mx-auto" />
			</div>
		{/if}
		<div class="ml-2 p-2">
			<!-- found missing translation -->
			<button
				type="button"
				class="border rounded-2xl font-bold w-24 text-center px-0 py-2 hover:opacity-80"
				on:click={() => select('profile')}>Select</button
			>
			<input
				type="file"
				class="hidden"
				bind:this={files.profile.el}
				on:change={(e) => handleFile(e, 'profile')}
			/>
			{#if files.profile.filename}
				<div class="mt-2 text-sm">{files.profile.filename}</div>
			{/if}
		</div>
	</div>

	{#if tooLarge['profile']}
		<div class="text-red-600">Max file size 5MB</div>
	{/if}
</div>

<div>
	<div class="flex justify-between items-center">
		<span class="font-bold">{$t('user.settings.bannerImage')}</span>
	</div>
	<!-- found missing translation -->

	{#if banner}
		<img
			src={banner}
			class="w-full object-cover object-center visible overflow-hidden h-48 mb-4 hover:opacity-80"
			on:click={() => select('banner')}
			alt="Banner"
		/>
	{:else if user.banner}
		<img
			src={`/api/public/${user.username}-banner.webp`}
			class="w-full object-cover object-center visible overflow-hidden h-48 mb-4 hover:opacity-80"
			on:click={() => select('banner')}
			alt="Banner"
		/>
	{:else}
		<div
			class="bg-gradient-to-r {$colorTheme} w-full h-48 mb-4 cursor-pointer hover:opacity-80"
			on:click={() => select('banner')}
			alt="Banner"
		/>
	{/if}

	<!-- found missing translation -->
	<button
		type="button"
		class="border rounded-2xl font-bold w-24 text-center px-0 py-2 hover:opacity-80"
		on:click={() => select('banner')}>Select</button
	>
	<input
		type="file"
		class="hidden"
		bind:this={files.banner.el}
		on:change={(e) => handleFile(e, 'banner')}
	/>
	{#if files.banner.filename}
		<div class="mt-2 text-sm">{files.banner.filename}</div>
	{/if}

	{#if tooLarge['banner']}
		<div class="text-red-600">Max file size 5MB</div>
	{/if}
</div>

<!-- TODO
<div>
	<span class="font-bold mb-1 block">{$t('user.settings.theme')}</span>
	<p class="text-secondary mb-1">{$t('user.settings.themeDescription')}</p>
	{#each colorThemes as colors}
		<button
			type="button"
			class="hover:opacity-80 mr-2 w-10 h-10 bg-gradient-to-r {colors.color1} {colors.color2} rounded-xl border-2 {selectedTheme ===
			colors.theme
				? 'border-black'
				: ''}"
			on:click={() => handleThemeClick(colors)}
		/>
	{/each}
</div> -->
