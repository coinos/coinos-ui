<script>
	import { scale } from 'svelte/transition';
	import { Icon } from '$comp';

	export let data;
	let { subject } = data;
</script>

<div class="container px-4 text-center mx-auto">
	<div class="flex w-full py-20 max-w-[200px] mx-auto" in:scale={{ start: 0.5 }}>
		<Icon icon="check" style="mx-auto" />
	</div>
	<h1 class="text-3xl md:text-4xl font-bold mb-6">Request sent</h1>

	<a href={`/${subject.username}`}>
		<button class="bg-black text-white rounded-2xl w-20 py-3 font-bold hover:opacity-80">
			Done
		</button>
	</a>
</div>
