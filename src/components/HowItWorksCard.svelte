<script>
	import Icon from './Icon.svelte';
	import { t } from '$lib/translations';
	export let image;
	export let stepID;
</script>

<div class="space-y-5">
	<Icon icon={image} style="mx-auto w-32 h-32" />
	<p class="text-2xl font-medium">{$t('howItWorks.' + stepID + '.header')}</p>
	<p class="text-secondary text-xl font-medium w-full md:w-2/3 mx-auto">
		{$t('howItWorks.' + stepID + '.description')}
	</p>
</div>
