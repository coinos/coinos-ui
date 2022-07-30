<script>
	// we will want to dynamically use the users avatar on this screen if they have uploaded one

	import { user } from '$lib/store';
	import { goto } from '$app/navigation';
	import { Icon } from '$comp';
</script>

<header class="bg-gradient-to-r from-primary to-gradient h-[20vh] w-full relative">
	<nav class="flex justify-end items-center space-x-4 p-5">
    <a href={`/${$user.username}/receive`}>
		<button class="bg-white p-2 rounded-full w-12 h-12"
			><Icon icon="numpad" style="mx-auto" /></button
		>
    </a>
		<button class="bg-white p-2 rounded-full  w-12 h-12"
			><Icon icon="clock" style="mx-auto" /></button
		>
    <a href={`/${$user.username}`}>
    <button class="bg-white p-2 rounded-full  w-12 h-12"
			><Icon icon="profile" style="mx-auto" /></button
		>
    </a>
		<button class="bg-white p-2 rounded-full  w-12 h-12"
			><Icon icon="menu" style="mx-auto" /></button
		>
	</nav>
	<div
		class="absolute top-[calc(20vh-48px)] left-[calc(50vw-48px)] rounded-full border-4 border-white p-4 bg-gradient-to-r from-primary to-gradient w-24 h-24"
	>
		<Icon icon="logo-symbol-white" style="mx-auto" />
	</div>
</header>
