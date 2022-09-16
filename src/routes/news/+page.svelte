<script>
	import { Icon, Footer } from '$comp';
	import { t } from '$lib/translations';
</script>

<a href="/">
	<Icon icon="logo" style="mx-auto mt-10" />
</a>
<div class="w-11/12 md:w-3/4 lg:w-1/2 2xl:w-1/3 max-w-3xl mx-auto my-20 space-y-5">
	<h1 class="text-5xl font-medium">{$t('news.header')}</h1>

	<h2 class="text-2xl font-medium">{$t('news.subheader')}</h2>

	<p class="text-justify text-xl text-secondary">
		{$t('news.update1')}
	</p>
</div>

<Footer />
