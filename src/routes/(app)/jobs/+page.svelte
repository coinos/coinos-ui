<script>
	import { Icon, Footer } from '$comp';
	import { t } from '$lib/translations';
</script>

<a href="/">
	<Icon icon="logo" style="mx-auto mt-10" />
</a>
<div class="w-11/12 md:w-3/4 lg:w-1/2 2xl:w-1/3 max-w-3xl mx-auto my-20 space-y-5">
	<h1 class="text-5xl font-medium">{$t('jobs.header')}</h1>

	<h2 class="text-2xl font-medium">{$t('jobs.subheader')}</h2>

	<p class="text-justify text-xl text-secondary">
		{$t('jobs.pitch1')}
		<br /><br />
		{$t('jobs.pitch2')}
		<a
			href="https://github.com/hashme"
			target="_blank"
			rel="noreferrer"
			class="underline underline-offset-4">{$t('jobs.github')}</a
		>.
		<br /><br />
		{$t('jobs.pitch3')}
		<a href="mailto:contact@hashme.io" class="underline underline-offset-4">contact@hashme.io</a>.
	</p>
</div>

<Footer />
