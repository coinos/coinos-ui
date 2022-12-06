<script>
	import { Icon, Image, LocaleSelector } from '$comp';
	import { t } from '$lib/translations';

	const followLinks = [
		{ url: 'https://twitter.com/Maven_NFT', titleID: 'twitter' },
		// { url: 'https://github.com/coinos', titleID: 'github' },
		{ url: 'https://t.me/+ilP5pTpC95U0ZmYx', titleID: 'telegram' }
	];

	const companyLinks = [
		// { url: '/news', titleID: 'news' },
		{ url: '/support', titleID: 'support' }
		// { url: '/jobs', titleID: 'jobs' }
	];
</script>

<footer class="space-y-10 md:space-y-0 text-xl block md:flex justify-around items-center mb-20">
	<div class="flex-col justify-items-center">
		<div class="text-center w-full mb-17 mx-auto w-20 md:justify-self-start md:mx-0">
      <a href="/"><img src="/icons/logowallet.webp" class="md:w-20" /></a>
		</div>
		<div class="w-[220px] mx-auto md:ml-0">
			<Image image={"poweredByCoinos"} style="mb-5 object-cover"/>
		</div>
		<div class="flex flex-col md:flex-row">
			<div class="mx-auto">
				<a href="/register">
					<button
						class="bg-black text-white border rounded-full px-6 py-4 font-bold hover:opacity-80 text-lg"
					>
						{$t('nav.startInSeconds')}
					</button>
				</a>
			</div>
			<LocaleSelector style="p-2 rounded-md text-center hover:opacity-80 cursor-pointer" />
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
