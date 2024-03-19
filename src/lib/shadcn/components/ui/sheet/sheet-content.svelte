<script>
	import { Dialog as SheetPrimitive } from "bits-ui";
	import X from "lucide-svelte/icons/x";
	import { SheetOverlay, SheetPortal, sheetTransitions, sheetVariants } from ".";
	import { cn } from "$lib/shadcn/utils";
	import { fly } from "svelte/transition";
	let className = undefined;
	export let side = "right";
	export { className as class };
	export let inTransition = fly;
	export let inTransitionConfig = sheetTransitions[side ? side : "right"]["in"];
	export let outTransition = fly;
	export let outTransitionConfig = sheetTransitions[side ? side : "right"]["out"];
</script>

<SheetPortal>
	<SheetOverlay />
	<SheetPrimitive.Content
		{inTransition}
		{inTransitionConfig}
		{outTransition}
		{outTransitionConfig}
		class={cn(sheetVariants({ side }), className)}
		{...$$restProps}
	>
		<slot />
		<SheetPrimitive.Close
			class="absolute right-4 top-4 rounded-sm opacity-100 ring-offset-background hover:bg-swapee-purple transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-black dark:data-[state=open]:bg-white"
		>
			<X class="h-8 w-8" />
			<span class="sr-only">Close</span>
		</SheetPrimitive.Close>
	</SheetPrimitive.Content>
</SheetPortal>
