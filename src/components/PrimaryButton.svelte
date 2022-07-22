<script>
	export let title;
	export let click;
</script>

<button class="bg-black text-white border rounded-full px-6 py-2 font-bold" on:click={click}
	>{title}
</button>
