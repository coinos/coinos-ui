<script>
	import { goto } from '$app/navigation';
	import { PrimaryButton, Icon, Image } from '$comp';
</script>

<div>
	<div class="space-y-10">
		<h1
			class="text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl font-medium text-center w-full md:w-3/4 lg:w-1/2 max-w-7xl mx-auto leading-tight"
		>
			The <span class="relative">
				easiest
				<Icon icon="rays" style="absolute -top-16 left-5 md:left-8 lg:left-14 2xl:left-24" />
			</span> way to accept Bitcoin in your store.
		</h1>
		<h2
			class="text-center text-secondary w-full md:w-3/5 lg:w-2/5 max-w-3xl mx-auto text-xl leading-normal font-medium"
		>
			Grow your customer base and revenue by accepting Bitcoin with an easy-to-use and managed Point
			of Sale. No software or hardware required.
		</h2>
		<div class="flex justify-center">
			<PrimaryButton title="Start in Seconds" click={() => goto('/register')} />
		</div>
	</div>

	<!-- hero image -->
	<Image image="hero-image" style="w-full md:w-2/3 max-w-5xl mx-auto mt-20" />
</div>
