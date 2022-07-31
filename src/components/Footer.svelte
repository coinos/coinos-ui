<script>
	import { Icon } from '$comp';

	const followLinks = [
		{ url: 'https://twitter.com/coinoswallet', title: 'Twitter' },
		{ url: 'https://github.com/coinos', title: 'GitHub' },
		{ url: 'https://t.me/coinos', title: 'Telegram' }
	];

	const companyLinks = [
		{ url: 'mailto:support@coinos.io', title: 'Support' },
		{ url: '/community', title: 'Community' },
		{ url: '/jobs', title: 'Jobs' }
	];
</script>

<footer class="space-y-10 md:space-y-0 text-xl block md:flex justify-around items-center mb-20">
	<Icon icon="logo" style="w-48 mx-auto md:mx-0" />

	<div class="text-center md:text-left">
		<p class="font-semibold">Follow Us</p>
		<ul class="mt-5 text-secondary space-y-3 font-medium">
			{#each followLinks as link}
				<li><a href={link.url} target="_blank" rel="noreferrer">{link.title}</a></li>
			{/each}
		</ul>
	</div>

	<div class="text-center md:text-left">
		<p class="font-semibold">Company</p>
		<ul class="mt-5 text-secondary space-y-3">
			{#each companyLinks as link}
				<li><a href={link.url}>{link.title}</a></li>
			{/each}
		</ul>
	</div>

	<Icon icon="shield" style="mx-auto md:mx-0" />
</footer>
