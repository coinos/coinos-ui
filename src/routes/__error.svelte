<script context="module">
	export function load({ error, status }) {
		if (error.message.includes('not found')) {
			error.message = 'Page not found';
			status = 404;
		}

		return {
			props: {
				error,
				status
			}
		};
	}
</script>

<script>
	import { Icon, PageNotFound } from '$comp';
	export let status, error;
</script>

{#if status === 404}
	<PageNotFound />
{:else}
	<div class="flex justify-center items-center mt-20">
		<div class="space-y-5 text-center">
			<a href="/">
				<Icon icon="logo" />
			</a>

			<Icon icon="error" style="mx-auto w-full" />

			<h1 class="font-bold text-5xl">Error</h1>
			<p>{error.message}</p>
			<p>Please try again or contact support.</p>
		</div>
	</div>
{/if}
