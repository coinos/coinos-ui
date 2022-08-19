<script>
  import { page } from '$app/stores';
	import { Icon, PageNotFound } from '$comp';
  import { _ } from 'svelte-i18n';
</script>

{#if $page.error.message.includes('not found') || $page.status === 404}
	<PageNotFound />
{:else}
	<div class="flex justify-center items-center mt-20">
		<div class="space-y-5 text-center">
			<a href="/">
				<Icon icon="logo" style="mx-auto" />
			</a>

			<Icon icon="error" style="mx-auto w-56" />

			<h1 class="font-bold text-5xl">{$_('error.header'), { default: "Error" }}</h1>
			<p class="px-1 w-full md:w-96 break-all font-bold">{$page.error.message.toUpperCase()}</p>
			<p>{$_('error.message'), { default: "Please try again or contact support." }}</p>
		</div>
	</div>
{/if}
