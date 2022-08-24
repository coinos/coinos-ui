<script>
	import { Image, Icon, LocationsMap } from '$comp';
	import { t } from '$lib/translations';
</script>

<h3 class="text-5xl font-medium mb-10 text-center">{$t('about.header')}</h3>
<div
	class="md:px-10 lg:px-0 block lg:flex justify-center text-secondary text-xl lg:space-x-20 mx-auto max-w-7xl relative"
>
	<p class="w-full lg:w-5/12">
		{@html $t('about.p1')}
		<br /><br />
		{@html $t('about.p2')}
		<br /><br />
	</p>
	<p class="w-full lg:w-5/12">
		{@html $t('about.p3')}
		<br /><br />
		{@html $t('about.p4')}
	</p>
	<Image image="swoosh" style="w-32 absolute -bottom-20 lg:bottom-0 right-0 md:right-10" />
</div>

<div class="px-5 block lg:flex justify-center lg:space-x-32 items-center mt-40 lg:mt-20">
	<div class="space-y-5 mb-5 lg:mb-0">
		<h3 class="text-5xl font-medium mb-10 text-center lg:text-right">
			{$t('about.founder.header')}
		</h3>

		<Image image="adam" style="rounded-full mx-auto lg:mx-0 lg:ml-auto w-40" />

		<div class="space-y-2">
			<span class="text-2xl text-center font-semibold block lg:text-right"
				>{$t('about.founder.name')}</span
			>
			<span class="text-xl text-center text-secondary block lg:text-right"
				>{$t('about.founder.position')}</span
			>
		</div>

		<div class="flex justify-center lg:justify-end items-center space-x-5">
			<a
				href="https://twitter.com/adamsoltys"
				target="_blank"
				rel="noreferrer"
				class="rounded-full p-2 bg-[#1D9BF0]"><Icon icon="twitter" style="w-6" /></a
			>
			<a
				href="https://github.com/asoltys"
				target="_blank"
				rel="noreferrer"
				class="rounded-full p-2 bg-gray-800"><Icon icon="github" style="w-6" /></a
			>
		</div>
	</div>

	<ul class="w-full mx-auto md:w-[700px] lg:w-[500px] xl:w-auto text-secondary px-1 md:px-10 text-xl list-disc space-y-5">
      <li>{$t('about.founder.qualifications.bitcoin')}</li>
      <li>{$t('about.founder.qualifications.webDev')}</li>
      <li>{$t('about.founder.qualifications.bitcoinVancouver')}</li>
      <li>{$t('about.founder.qualifications.bitcoinCoop')}</li>
      <li>{$t('about.founder.qualifications.beliefs')}</li>
      <li>{$t('about.founder.qualifications.familialRelationships')}</li>
  </ul>
</div>

<div class="mt-20">
	<h3 class="text-5xl font-medium mb-5 text-center">{$t('about.locations.header')}</h3>
	<p class="text-secondary text-xl w-full md:w-10/12 lg:w-2/3 2xl:w-[800px] mx-auto mb-10">
		{@html $t('about.locations.description')}
	</p>
	<LocationsMap />
</div>
