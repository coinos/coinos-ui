<script>
	import { Button as ButtonPrimitive } from "bits-ui";
	import { cn } from "$lib/shadcn/utils";
	import { buttonVariants } from ".";
	let className = undefined;
	export let variant = "default";
	export let size = "default";
	export let builders = [];
	export { className as class };
</script>

<ButtonPrimitive.Root
	{builders}
	class={cn(buttonVariants({ variant, size, className }))}
	type="button"
	{...$$restProps}
	on:click
	on:keydown
>
	<slot />
</ButtonPrimitive.Root>
