<script>
	import { copy } from '$lib/utils';
	import { Icon } from '$comp';
	import samples from '$lib/samples';
	export let sample;
</script>

<div class="bg-black text-white rounded-lg p-4 flex gap-4 whitespace-pre-wrap font-mono">
	<div class="overflow-x-scroll max-w-full scrollbar-hide">
		<div class="break-all min-w-[800px]">{samples[sample]}</div>
	</div>
	<button
		class="ml-auto my-auto invert opacity-90"
		on:click={() => copy(samples[sample].replace(/^\s+/gm, '').replace(/\n/g, ''))}
		><Icon icon="copy" style="w-10 max-w-none" /></button
	>
</div>

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}

	/* For IE, Edge and Firefox */
	.scrollbar-hide {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
</style>
