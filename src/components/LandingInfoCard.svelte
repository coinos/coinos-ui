<script>
	export let gradients;
	export let image;
	export let title;
	export let description;
	export let order;
</script>

<div class="block lg:flex justify-center lg:space-x-20 items-center">
	<div
		class="{order === 'reverse' &&
			'order-last'} bg-gradient-to-r {gradients} rounded-full w-[250px] h-[250px] md:w-[300px] md:h-[300px] lg:w-[350px] lg:h-[350px] xl:w-[450px] xl:h-[450px] 2xl:w-[500px] 2xl:h-[500px] flex justify-center items-center mx-auto lg:mx-0 mb-10 lg:mb-0"
	>
		{#if image}
			<img src="/images/{image}.svg" alt={image} class="w-5/6" />
		{/if}
	</div>
	<div class="w-full lg:w-1/2 max-w-3xl space-y-10 mx-auto lg:mx-0">
		<h3 class="text-5xl font-medium text-left">{title}</h3>
		<p class="text-secondary text-xl font-medium w-full lg:w-3/4 mx-auto lg:mx-0">
			{#if description}
				{description}
			{:else}
				<slot />
			{/if}
		</p>
	</div>
</div>
