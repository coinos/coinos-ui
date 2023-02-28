<script>
	import { copy } from '$lib/utils';
	import { Icon } from '$comp';
	import samples from '$lib/samples';
	export let sample;
</script>

<div class="bg-black text-white rounded-lg p-4 flex gap-4 whitespace-pre-wrap font-mono">
	<div class="w-full break-all">{samples[sample]}</div>
	<button
		class="ml-auto my-auto invert opacity-90"
		on:click={() => copy(samples[sample].replace(/^\s+/gm, '').replace(/\n/g, ''))}
		><Icon icon="copy" style="w-8" /></button
	>
</div>
