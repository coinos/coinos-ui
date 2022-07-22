<script>
	import Icon from './Icon.svelte';
	export let image;
	export let step;
	export let description;
</script>

<div class="space-y-5">
	<Icon icon={image} style="mx-auto w-32 h-32" />
	<p class="text-2xl font-medium">{step}</p>
	<p class="text-secondary text-xl font-medium w-full md:w-2/3 mx-auto">
		{description}
	</p>
</div>
