<script>
	export let question;
	export let answer;
</script>

<div class="mx-auto w-full md:w-2/3 lg:w-1/2 space-y-5">
	<p class="text-2xl font-medium">{question}</p>
	<p class="text-secondary text-xl font-medium w-full md:w-2/3 max-w-2xl">
		{answer}
	</p>
</div>
