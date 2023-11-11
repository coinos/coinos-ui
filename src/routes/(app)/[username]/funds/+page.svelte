<script>
	import { Avatar, Icon } from '$comp';
	import { t } from '$lib/translations';

  export let data;

  let { funds } = data;
</script>

<div class="mt-24 mb-20">
	<h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold mb-10">
		Funds
	</h1>

	<div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5">
		<div class="text-base">
					<div class="grid grid-cols-3 border-b h-24 hover:bg-gray-100 px-4">
						<div class="whitespace-nowrap my-auto">

							<div class="text-secondary">
								
							</div>
						</div>

						<div class="flex my-auto">
									<div class="text-secondary flex">
										<div class="my-auto mr-1">
											<img src="/images/moneypot.png" class="w-12" alt="Pot" />
										</div>

										<div class="my-auto">Pot</div>
									</div>
						</div>

						<div class="text-secondary text-right text-sm my-auto">
							<div>
							
							</div>
						</div>
					</div>
		</div>

		<button
			class="ml-auto rounded-full border py-2 px-4 w-36 hover:opacity-80 flex mx-auto"
		>
			<Icon icon="plus" style="opacity-50 mr-2 my-auto" />
			<div class="my-auto">{$t('payments.create')}</div>
		</button>
	</div>
</div>

<style>
	.active * {
		@apply bg-black text-white border-black;
	}
</style>
