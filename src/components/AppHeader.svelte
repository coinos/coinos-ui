<script>
	import OutClick from 'svelte-outclick';
	import { user, newPayment, colorTheme, tempProfileFiles } from '$lib/store';
	import { goto } from '$app/navigation';
	import { Icon } from '$comp';
	import { t } from '$lib/translations';

	export let avatarPosition = 'left-[calc(50vw-48px)]';

	const menuButtons = [
		{ stringID: 'nav.dashboard', icon: 'dash', goto: 'dashboard' },
		{ stringID: 'nav.settings', icon: 'settings', goto: 'settings' },
		{ stringID: 'nav.support', icon: 'support', goto: 'support' },
		{ stringID: 'nav.signOut', icon: 'logout', goto: 'logout' }
	];

	let showMenu = false;

	const handleMenuItemClick = (item) => {
		if (item === 'logout') {
			goto('/logout');
		} else {
			showMenu = false;
			goto(`/${$user.username + '/' + item}`);
		}
	};

	$: background = $tempProfileFiles && $tempProfileFiles.banner ? `url(${$tempProfileFiles.banner})` : $user?.banner ? `url(/api/public/${$user.username}-banner.png)` : undefined;
</script>

<header class="bg-gradient-to-r {$colorTheme} h-[175px] w-full relative" style:background>
	<nav class="flex justify-end items-center space-x-4 p-5">
		{#if $user}
			<a href={`/${$user.username}/receive`}>
				<button class="bg-white p-2 rounded-full w-12 h-12"
					><Icon icon="numpad" style="mx-auto" />
				</button>
			</a>
			<a href={`/${$user.username}/transactions`}>
				<button class="bg-white p-2 rounded-full w-12 h-12 relative"
					><Icon icon="clock" style="mx-auto" />
					{#if $newPayment}
						<span class="absolute top-0 right-0">
							<span class="flex h-3 w-3">
								<span
									class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F7931A] opacity-75"
								/>
								<span class="relative inline-flex rounded-full h-3 w-3 bg-[#F7931A]" />
							</span>
						</span>
					{/if}
				</button>
			</a>
			<a href={`/${$user.username}`}>
				<button class="bg-white p-2 rounded-full w-12 h-12"
					><Icon icon="profile" style="mx-auto" />
				</button>
			</a>
			<div class="relative">
				<OutClick on:outclick={() => (showMenu = false)}>
					<button
						class="bg-white p-2 rounded-full  w-12 h-12"
						on:click={() => (showMenu = !showMenu)}
						><Icon icon="menu" style="mx-auto" />
					</button>

					<div
						class="{showMenu
							? 'block'
							: 'hidden'} absolute top-14 right-0 bg-white rounded-3xl p-8 shadow-xl z"
					>
						<ul class="space-y-5 w-32">
							{#each menuButtons as button}
								<li>
									<button
										class="flex justify-center items-center font-semibold text-sm"
										on:click={() => handleMenuItemClick(button.goto)}
										><Icon icon={button.icon} style="mr-1" /> {$t(button.stringID)}
									</button>
								</li>
							{/each}
						</ul>
					</div>
				</OutClick>
			</div>
		{:else}
			<a href="/login">
				<button class="bg-white px-5 py-2 rounded-xl font-semibold text-sm"
					>{$t('nav.signIn')}</button
				>
			</a>
		{/if}
	</nav>
	{#if $user.profile}
		<div class="absolute top-[calc(175px-48px)] {avatarPosition} rounded-full overflow-hidden text-center w-24 h-24 my-auto">
			<img
				src={$tempProfileFiles && $tempProfileFiles.profile ? $tempProfileFiles.profile : `/api/public/${$user.username}-profile.png`}
				class="absolute w-full h-full object-cover object-center visible overflow-hidden"
			/>
		</div>
	{:else}
		<div
			class="absolute top-[calc(175px-48px)] {avatarPosition} rounded-full border-4 border-white p-4 bg-gradient-to-r {$colorTheme} w-24 h-24"
		>
			<Icon icon="logo-symbol-white" style="mx-auto" />
		</div>
	{/if}
</header>

<style>
	.z {
		z-index: 100;
	}
</style>
