<script>
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import { cn } from "$lib/shadcn/utils";
	let className = undefined;
	export let value;
	export { className as class };
</script>

<AccordionPrimitive.Item {value} class={cn("border-b", className)} {...$$restProps}>
	<slot />
</AccordionPrimitive.Item>
