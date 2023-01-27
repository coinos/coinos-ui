<script>
	import { avatar, banner, colorTheme } from '$lib/store';
	import { Icon } from '$comp';
	import { punk } from '$lib/utils';

	export let user;
	export let size = 32;
	export let disabled = false;

	$: s = size.toString();
	$: link = user.anon ? `/${user.pubkey}` : `/${user.username}`;

	$: src = ($avatar?.id === user.id && $avatar.src) || 
		'/api/public/' +
		(user.profile ? user.id + '-profile.webp' : 'punks/' + punk(user.pubkey || user.id || 'aa'));
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
