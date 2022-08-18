<script>
	import Icon from './Icon.svelte';
  import { _ } from 'svelte-i18n';
	export let image;
	export let stepID;
</script>

<div class="space-y-5">
	<Icon icon={image} style="mx-auto w-32 h-32" />
	<p class="text-2xl font-medium">{$_('howItWorks.' + stepID + '.header')}</p>
	<p class="text-secondary text-xl font-medium w-full md:w-2/3 mx-auto">
		{$_('howItWorks.' + stepID + '.description')}
	</p>
</div>
