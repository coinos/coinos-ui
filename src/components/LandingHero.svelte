<script>
	import { goto } from '$app/navigation';
	import { Icon, Image } from '$comp';
	import { t } from '$lib/translations';
</script>

<div class="mt-[96.88px] md:mt-0">
	<div class="space-y-10">
		<h1
			class="text-5xl md:text-6xl lg:text-7xl font-medium text-center w-full md:w-3/4 lg:w-1/2 max-w-7xl mx-auto leading-tight"
		>
    Bitchat
			<span class="relative">
        and 
				<Icon icon="rays" style="absolute -top-16 left-5 md:left-8 lg:left-14 2xl:left-24" />
			</span>
Lightning Wallet
		</h1>

		<div class="flex justify-center">
			<a href="/register">
				<button
					class="bg-black text-white border rounded-full px-6 py-2 font-bold hover:opacity-80"
				>
					{$t('nav.startInSeconds')}
				</button>
			</a>
		</div>
	</div>

	<Image image="hero-image" style="w-full md:w-2/3 max-w-5xl mx-auto mt-20" />
</div>
