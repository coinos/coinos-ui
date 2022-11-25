<script>
	import { Icon, Image } from '$comp';
	import { t } from '$lib/translations';

  let team = [
    {
      name: 'patrick',
    },
		{
			name: 'adam',
		}
		
		
	];
	
</script>

<div class="flex justify-center">
	<div class="container space-y-10">
		<div class="space-y-10 2xl:space-y-0 2xl:grid gap-y-10 grid-cols-2">
			{#each team as member}
				<div class="flex w-full">
					<div class="md:flex 2xl:items-start md:max-w-2xl mx-auto">
						<div class="w-[220px] mx-auto">
							<Image image={member.name} style="rounded-full mx-auto w-40 h-40 mb-5 object-cover" />
							<div class="space-y-2">
								<span class="text-2xl text-center font-semibold block"
									>{$t(`about.team.${member.name}.name`)}</span
								>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
<div class="mx-auto w-full md:w-2/3 lg:w-[700px] space-y-5">
	<p class="text-secondary text-xl font-medium">
    {$t(`Patrick Hiebert, Founder of MAVEN, Vida Verde Agroforestry and EcoVillages is partnering with
    Adam Soltys, Founder and Developer of Coinos, to bring an easy to use Bitcoin wallet to Central America.`)} 
  </p>
  <p class="text-secondary text-xl font-medium">
    {$t(`
    Adam collaborated with Patrick on the development of MAVEN NFT Marketplace to not only be able to sell
    Harvest Share earning from a real teak and avocado farm in Nicaragua as a Bitcoin NFT, but to give back to
    the community and families working on the farm and surrounding areas to help develop the Bitcoin circular
    economy, much like that in El Salvador.`)}
  </p>
  <p class="text-secondary text-xl font-medium">
    {$t(`
    Not only will the families connected to the project be able to use this wallet ... anyone who would like to
    accept and use Bitcoin will be able to use the MAVEN wallet!`)}
  </p>
</div>