<script>
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import { cn } from "$lib/shadcn/utils";
	import { slide } from "svelte/transition";
	let className = undefined;
	export let transition = slide;
	export let transitionConfig = {
		duration: 200,
	};
	export { className as class };
</script>

<AccordionPrimitive.Content
	class={cn("overflow-hidden text-sm transition-all", className)}
	{transition}
	{transitionConfig}
	{...$$restProps}
>
	<div class="pb-4 pt-0">
		<slot />
	</div>
</AccordionPrimitive.Content>
