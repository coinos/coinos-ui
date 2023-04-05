<script>
	export let locations;

	import { Image, Icon, LocationsMap } from '$comp';
	import { t } from '$lib/translations';

	let team = [
		{
			name: 'adam',
			socials: [
				{ type: 'twitter', url: 'https://twitter.com/adamsoltys', color: 'bg-[#1D9BF0]' },
				{ type: 'github', url: 'https://github.com/asoltys', color: 'bg-gray-800' }
			]
		},
		{ name: 'cole', socials: [] }
	];
</script>

{#if locations?.length}
	<div>
		<h3 class="text-5xl font-medium mb-5 text-center">{$t('about.locations.header')}</h3>
		<p class="text-secondary text-xl w-full md:w-10/12 lg:w-2/3 2xl:w-[800px] mx-auto mb-10">
			{@html $t('about.locations.description')}
		</p>
		<LocationsMap {locations} />
	</div>
{/if}
