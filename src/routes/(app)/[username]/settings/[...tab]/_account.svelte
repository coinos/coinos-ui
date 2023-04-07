<script>
	import { tick } from 'svelte';
	import { colorTheme, avatar, banner } from '$lib/store';
	import { Icon } from '$comp';
	import { t } from '$lib/translations';

	export let user;
	let { id } = user;

	let selectedTheme = 1;
	let avatarFile, avatarInput, bannerFile, bannerInput;

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

	let selectAvatar = () => avatarInput.click();
	let selectBanner = () => bannerInput.click();

	let percent;
	let progress = async (event) => {
		percent = Math.round((event.loaded / event.total) * 100);
	};

	let tooLarge = {};

	let handleFile = async ({ target }, type) => {
		tooLarge[type] = false;
		let file = target.files[0];
		if (!file) return;

		if (file.size > 10000000) return (tooLarge[type] = true);

		if (type === 'profile') {
			$avatar = { id, file, type, progress };
		} else if (type === 'banner') {
			$banner = { id, file, type, progress };
		}

		var reader = new FileReader();
		reader.onload = async (e) => {
			if (type === 'profile') {
				$avatar.src = e.target.result;
			} else if (type === 'banner') {
				$banner.src = e.target.result;
			}
		};

		reader.readAsDataURL(file);
	};

	if (!user.display) user.display = user.username;
</script>

<div class="relative">
	<div>
		<label for="username" class="font-bold mb-1 block">{$t('user.settings.username')}</label>
		<input type="text" name="username" bind:value={user.username} />
	</div>
	<div
		class="absolute right-[2px] top-[30px] text-gray-600 rounded-r-2xl p-4 h-[54px] my-auto border-l "
	>
		@hashme.io
	</div>
</div>

<div>
	<label for="display" class="font-bold mb-1 block">{$t('user.settings.displayName')}</label>
	<input type="text" name="display" bind:value={user.display} />
</div>

<div>
	<span class="font-bold">{$t('user.settings.profileImage')}</span>

	<div class="flex">
		{#if $avatar || user.profile}
			<div
				class="relative rounded-full overflow-hidden text-center w-20 h-20 my-auto hover:opacity-80 cursor-pointer"
				on:click={selectAvatar}
				on:keydown={selectAvatar}
			>
				<img
					src={$avatar?.src || `/api/public/${user.id}-profile.webp`}
					class="absolute w-full h-full object-cover object-center visible overflow-hidden"
					alt={user.username}
				/>
			</div>
		{:else}
			<div
				class="rounded-full border-4 border-white p-4 bg-gradient-to-r {$colorTheme} w-24 my-auto hover:opacity-80 cursor-pointer"
				on:click={selectAvatar}
				on:keydown={selectAvatar}
			>
				<Icon icon="logo-symbol-white" style="mx-auto" />
			</div>
		{/if}
		<div class="ml-2 p-2">
			<!-- found missing translation -->
			<button
				type="button"
				class="border rounded-2xl font-bold w-24 text-center px-0 py-2 hover:opacity-80"
				on:click={selectAvatar}
				on:keydown={selectAvatar}>{$t('user.settings.select')}</button
			>
			<input
				type="file"
				class="hidden"
				bind:this={avatarInput}
				on:change={(e) => handleFile(e, 'profile')}
			/>
		</div>
	</div>

	{#if tooLarge['avatar']}
		<div class="text-red-600">Max file size 10MB</div>
	{/if}
</div>

<div>
	<div class="flex justify-between items-center">
		<span class="font-bold">{$t('user.settings.bannerImage')}</span>
	</div>

	{#if $banner || user.banner}
		<img
			src={$banner ? $banner.src : `/api/public/${user.id}-banner.webp`}
			class="w-full object-cover object-center visible overflow-hidden h-48 mb-4 hover:opacity-80"
			on:click={selectBanner}
			on:keydown={selectBanner}
			alt="Banner"
		/>
	{:else}
		<div
			class="bg-gradient-to-r {$colorTheme} w-full h-48 mb-4 cursor-pointer hover:opacity-80"
			on:click={selectBanner}
			on:keydown={selectBanner}
			alt="Banner"
		/>
	{/if}

	<button
		type="button"
		class="border rounded-2xl font-bold w-24 text-center px-0 py-2 hover:opacity-80"
		on:click={selectBanner}
		on:keydown={selectBanner}>{$t('user.settings.select')}</button
	>
	<input
		type="file"
		class="hidden"
		bind:this={bannerInput}
		on:change={(e) => handleFile(e, 'banner')}
	/>

	{#if tooLarge['banner']}
		<div class="text-red-600">Max file size 10MB</div>
	{/if}
</div>

<div>
	<label for="address" class="font-bold mb-1 block">{$t('user.settings.about')}</label>
	<textarea
		type="text"
		name="address"
		bind:value={user.address}
		placeholder={$t('user.settings.aboutPlaceholder')}
	/>
</div>
