<script>
	// we will want to dynamically use the users avatar on this screen if they have uploaded one

	import { user } from '$lib/store';
	import { goto } from '$app/navigation';
	import { Icon } from '$comp';

	const menuButtons = [
		{ title: 'Customers', icon: 'customers', goto: 'customers' },
		{ title: 'Dashboard', icon: 'dash', goto: 'dashboard' },
		{ title: 'Settings', icon: 'settings', goto: 'settings' },
		{ title: 'Support', icon: 'support', goto: 'support' },
		{ title: 'Sign out', icon: 'logout', goto: 'logout' }
	];

	let showMenu = false;

	const handleMenuItemClick = (item) => {
		if (item === 'logout') {
			goto('/logout');
		} else {
			goto(`/${$user.username + '/' + item}`);
		}
	};
</script>

<header class="bg-gradient-to-r from-primary to-gradient h-[20vh] w-full relative">
	<nav class="flex justify-end items-center space-x-4 p-5">
		<a href={`/${$user.username}/receive`}>
			<button class="bg-white p-2 rounded-full w-12 h-12"
				><Icon icon="numpad" style="mx-auto" />
			</button>
		</a>
		<a href={`/${$user.username}/transactions`}>
			<button class="bg-white p-2 rounded-full  w-12 h-12"
				><Icon icon="clock" style="mx-auto" />
			</button>
		</a>
		<a href={`/${$user.username}`}>
			<button class="bg-white p-2 rounded-full  w-12 h-12"
				><Icon icon="profile" style="mx-auto" />
			</button>
		</a>
		<div class="relative">
			<button class="bg-white p-2 rounded-full  w-12 h-12" on:click={() => (showMenu = !showMenu)}
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
								><Icon icon={button.icon} style="mr-1" /> {button.title}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</nav>
	<div
		class="absolute top-[calc(20vh-48px)] left-[calc(50vw-48px)] rounded-full border-4 border-white p-4 bg-gradient-to-r from-primary to-gradient w-24 h-24"
	>
		<Icon icon="logo-symbol-white" style="mx-auto" />
	</div>
</header>

<style>
	.z {
		z-index: 100;
	}
</style>
