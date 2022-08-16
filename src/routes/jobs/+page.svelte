<script>
	import { Icon } from '$comp';
	import { goto } from '$app/navigation';
</script>

<a href="/">
	<Icon icon="logo" style="mx-auto mt-10" />
</a>
<div class="w-11/12 md:w-3/4 lg:w-1/2 2xl:w-1/3 max-w-3xl mx-auto my-20 space-y-5">
	<button on:click={() => goto('/')}>
		<Icon icon="arrow-left" style="w-8" />
	</button>
	<h1 class="text-5xl font-medium">Jobs</h1>

	<h2 class="text-2xl font-medium">Current Openings</h2>

	<p class="text-justify text-xl text-secondary">
		CoinOS is actively looking for developers to join our growing team (full-time or part-time,
		remote working OK).
		<br /><br />
		Excited about working on open source bitcoin? Then take a look at our repositories on
		<a
			href="https://github.com/coinos"
			target="_blank"
			rel="noreferrer"
			class="underline underline-offset-4">GitHub</a
		>.
		<br /><br />
		If you think you can make an impact, we'd love to hear from you. Send us your resume to
		<a href="mailto:contact@coinos.io" class="underline underline-offset-4">contact@coinos.io</a>.
	</p>
</div>
