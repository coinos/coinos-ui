<script>
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

<div class="container grid grid-cols-2">
	{#each team as member}
		<div class="flex">
			<div class="flex">
				<Image image={member.name} style="rounded-full mx-auto lg:mx-0 lg:ml-auto w-40" />

				<div class="space-y-2">
					<span class="text-2xl text-center font-semibold block lg:text-right"
						>{$t(`about.team.${member.name}.name`)}</span
					>
					<span class="text-xl text-center text-secondary block lg:text-right"
						>{$t(`about.team.${member.name}.position`)}</span
					>
				</div>

				<div class="flex justify-center lg:justify-end items-center space-x-5">
					{#each member.socials as social}
						<a
							href={social.url}
							target="_blank"
							rel="noreferrer"
							class={`rounded-full p-2 ${social.color}`}><Icon icon={social.type} style="w-6" /></a
						>
					{/each}
				</div>
			</div>
		</div>
		<div class="text-secondary text-xl">
			{$t(`about.team.${member.name}.bio`)}
		</div>
	{/each}
</div>

<div class="mt-20">
	<h3 class="text-5xl font-medium mb-5 text-center">{$t('about.locations.header')}</h3>
	<p class="text-secondary text-xl w-full md:w-10/12 lg:w-2/3 2xl:w-[800px] mx-auto mb-10">
		{@html $t('about.locations.description')}
	</p>
	<LocationsMap />
</div>
