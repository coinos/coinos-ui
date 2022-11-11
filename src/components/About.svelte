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
		{ name: 'cole', socials: [] },
		{
			name: 'gene',
			socials: []
		},
		{
			name: 'john',
			socials: []
		},
		{
			name: 'secondl1ght',
			socials: [
				{ type: 'twitter', url: 'https://www.twitter.com/secondl1ght', color: 'bg-[#1D9BF0]' },
				{ type: 'github', url: 'https://github.com/secondl1ght', color: 'bg-gray-800' }
			]
		},
		{
			name: 'shauna',
			socials: [
				{ type: 'twitter', url: 'https://twitter.com/ShaunaCollister', color: 'bg-[#1D9BF0]' },
				{
					type: 'linkedin',
					url: 'https://www.linkedin.com/in/shauna-collister-32905214',
					color: 'bg-[#0a66c2]'
				}
			]
		}
	];
</script>

<div class="flex justify-center">
	<div class="container space-y-10">
		<h3 class="text-5xl font-medium text-center">
			{$t('about.team.header')}
		</h3>
		<div class="space-y-10 2xl:space-y-0 2xl:grid gap-y-10 grid-cols-2">
			{#each team as member}
				<div class="md:flex justify-center items-center 2xl:items-start md:space-x-10">
					<div>
						<Image image={member.name} style="rounded-full mx-auto w-40 h-40 mb-5 object-cover" />

						<div class="space-y-2">
							<span class="text-2xl text-center font-semibold block"
								>{$t(`about.team.${member.name}.name`)}</span
							>
							<span class="text-xl text-center text-secondary block"
								>{$t(`about.team.${member.name}.position`)}</span
							>
						</div>

						<div class="mt-2 flex justify-center items-center space-x-5">
							{#each member.socials as social}
								<a
									href={social.url}
									target="_blank"
									rel="noreferrer"
									class={`rounded-full p-2 ${social.color} hover:opacity-80`}
									><Icon icon={social.type} style="w-6" /></a
								>
							{/each}
						</div>
					</div>
					<div class="mt-5 md:mt-0 text-secondary text-xl w-full md:w-[450px]">
						{$t(`about.team.${member.name}.bio`)}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<div>
	<h3 class="text-5xl font-medium mb-5 text-center">{$t('about.locations.header')}</h3>
	<p class="text-secondary text-xl w-full md:w-10/12 lg:w-2/3 2xl:w-[800px] mx-auto mb-10">
		{@html $t('about.locations.description')}
	</p>
	<LocationsMap {locations} />
</div>
