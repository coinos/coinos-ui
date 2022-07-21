<script>
	export let title;
	export let click;
</script>

<button class="border rounded-full px-6 py-2 font-bold" on:click={click}>{title}</button>
