<script>
	import { Icon, LocaleSelector } from '$comp';
	import { t } from '$lib/translations';

	const followLinks = [
		{ url: 'https://twitter.com/coinoswallet', titleID: 'twitter' },
		{ url: 'https://github.com/coinos', titleID: 'github' },
		{ url: 'https://t.me/coinos', titleID: 'telegram' }
	];

	const companyLinks = [
		{ url: '/news', titleID: 'news' },
		{ url: 'mailto:support@coinos.io', titleID: 'support' },
		{ url: '/jobs', titleID: 'jobs' }
	];
</script>

<footer class="space-y-10 md:space-y-0 text-xl block md:flex justify-around items-center mb-20">
	<div>
		<div class="text-center w-full mb-8">
			<a href="/"><Icon icon="logo" style="w-48 mx-auto md:mx-0" /></a>
		</div>
		<div class="text-center">
			<LocaleSelector style="p-3 rounded-md" />
		</div>
	</div>

	<div class="text-center md:text-left">
		<p class="font-semibold">{$t('footer.followUs')}</p>
		<ul class="mt-5 text-secondary space-y-3 font-medium">
			{#each followLinks as link}
				<li>
					<a href={link.url} target="_blank" rel="noreferrer">{$t('footer.' + link.titleID)}</a>
				</li>
			{/each}
		</ul>
	</div>

	<div class="text-center md:text-left">
		<p class="font-semibold">{$t('footer.company')}</p>
		<ul class="mt-5 text-secondary space-y-3">
			{#each companyLinks as link}
				<li><a href={link.url}>{$t('footer.' + link.titleID)}</a></li>
			{/each}
		</ul>
	</div>

	<Icon icon="shield" style="mx-auto md:mx-0" />
</footer>
