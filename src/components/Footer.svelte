<script>
	import { Icon, LocaleSelector } from '$comp';
	import { t } from '$lib/translations';

	const followLinks = [
		{ url: 'https://twitter.com/coinoswallet', titleID: 'twitter' },
		{ url: 'https://t.me/coinoswallet', titleID: 'telegram' },
		{ url: 'https://linktr.ee/coinos.io', titleID: 'linktree' }
	];

	const companyLinks = [
		{ url: '/docs', titleID: 'documentation' },
		{ url: '/support', titleID: 'support' },
		{ url: '/jobs', titleID: 'jobs' }
	];
</script>

<footer class="space-y-10 md:space-y-0 text-xl block md:flex justify-around items-center mb-20">
	<div class="space-y-5">
		<div class="text-center w-full">
			<a href="/"><Icon icon="logo" style="w-48 mx-auto md:mx-0" /></a>
		</div>
		<div class="flex gap-2 justify-center sm:hidden">
			<div>
				<a href="/register">
					<button
						class="bg-black text-white border rounded-full px-4 py-2 font-bold hover:opacity-80 text-lg"
					>
						{$t('nav.startInSeconds')}
					</button>
				</a>
			</div>
		</div>
		<div class="w-full flex">
			<div class="mx-auto">
				<LocaleSelector
					style="p-2 text-center hover:opacity-80 cursor-pointer border rounded-full"
				/>
			</div>
		</div>
	</div>

	<div class="text-center md:text-left">
		<p class="font-semibold">{$t('footer.followUs')}</p>
		<ul class="mt-5 text-secondary space-y-3 font-medium">
			{#each followLinks as link}
				<li>
					<a href={link.url} target="_blank" rel="noreferrer" class="hover:opacity-80"
						>{$t('footer.' + link.titleID)}</a
					>
				</li>
			{/each}
		</ul>
	</div>

	<div class="text-center md:text-left">
		<p class="font-semibold">{$t('footer.company')}</p>
		<ul class="mt-5 text-secondary space-y-3">
			{#each companyLinks as link}
				<li><a href={link.url} class="hover:opacity-80">{$t('footer.' + link.titleID)}</a></li>
			{/each}
		</ul>
	</div>

	<Icon icon="shield" style="mx-auto md:mx-0" />
</footer>
