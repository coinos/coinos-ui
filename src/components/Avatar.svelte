<script>
	import { colorTheme, tempProfileFiles } from '$lib/store';
	import { Icon } from '$comp';

	export let avatarPosition;
	export let user;
</script>

<div
	class="rounded-full border-4 border-white overflow-hidden w-32 h-32 bg-gradient-to-r {$colorTheme} flex justify-center items-center"
>
	<a href={`/${user.username}`}>
		{#if user?.profile}
			<img
				src={$tempProfileFiles && $tempProfileFiles.profile
					? $tempProfileFiles.profile
					: `/api/public/${user.username}-profile.png`}
				class="w-full h-full object-cover object-center overflow-hidden"
				alt={user.username}
			/>
		{:else}
			<Icon icon="logo-symbol-white" />
		{/if}
	</a>
</div>
