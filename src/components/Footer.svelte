<script>
	import { Icon } from '$comp';
  import { _ } from 'svelte-i18n';

	const followLinks = [
		{ url: 'https://twitter.com/coinoswallet', titleID: 'twitter' },
		{ url: 'https://github.com/coinos', titleID: 'github' },
		{ url: 'https://t.me/coinos', titleID: 'telegram' }
	];

	const companyLinks = [
		{ url: 'mailto:support@coinos.io', titleID: 'support' },
		{ url: '/jobs', titleID: 'jobs' }
	];
</script>

<footer class="space-y-10 md:space-y-0 text-xl block md:flex justify-around items-center mb-20">
	<Icon icon="logo" style="w-48 mx-auto md:mx-0" />

	<div class="text-center md:text-left">
		<p class="font-semibold">{$_('footer.followUs')}</p>
		<ul class="mt-5 text-secondary space-y-3 font-medium">
			{#each followLinks as link}
				<li><a href={link.url} target="_blank" rel="noreferrer">{$_('footer.' + link.titleID)}</a></li>
			{/each}
		</ul>
	</div>

	<div class="text-center md:text-left">
		<p class="font-semibold">{$_('footer.company')}</p>
		<ul class="mt-5 text-secondary space-y-3">
			{#each companyLinks as link}
				<li><a href={link.url}>{$_('footer.' + link.titleID)}</a></li>
			{/each}
		</ul>
	</div>

	<Icon icon="shield" style="mx-auto md:mx-0" />
</footer>
