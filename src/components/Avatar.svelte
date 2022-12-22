<script>
	import { colorTheme } from '$lib/store';
	import { Icon } from '$comp';
	import { runner } from '$lib/utils';

	export let user;
	export let size = 32;
	export let disabled = false;

	$: s = size.toString();
	$: link = user ? `/${user.username}` : '/';

	let src =
		'/api/public/' +
		(user?.profile
			? user.username + '-profile.webp'
			: 'runners/' + runner(user?.pubkey || parseInt(Math.random() * 255).toString(16)));
</script>

<a href={link} class:pointer-events-none={disabled}>
	<div
		class="w-{s} h-{s} rounded-full border-4 border-white overflow-hidden bg-gradient-to-r {$colorTheme} flex justify-center items-center"
	>
		<img
			{src}
			class="w-full h-full object-cover object-center overflow-hidden"
			alt={user.username}
		/>
	</div>
</a>
