<script>
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import { ChevronDown } from "lucide-svelte";
	import { cn } from "$lib/shadcn/utils";
	let className = undefined;
	export let level = 3;
	export { className as class };
</script>

<AccordionPrimitive.Header {level} class="flex">
	<AccordionPrimitive.Trigger
		class={cn(
			"flex flex-1 items-center justify-between py-2 font-medium transition-all [&[data-state=open]>svg]:rotate-180",
			className
		)}
		{...$$restProps}
		on:click
	>
		<slot />
		<ChevronDown class="h-4 w-4 transition-transform duration-200" />
	</AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
