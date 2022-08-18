<script>
	import { Icon } from '$comp';
  import { _ } from 'svelte-i18n';
</script>

<div class="flex justify-center items-center mt-20">
	<div class="space-y-5 text-center">
		<a href="/">
			<Icon icon="logo" style="mx-auto" />
		</a>

		<Icon icon="question" style="mx-auto w-56" />

		<h1 class="font-bold text-5xl">{$_('404.404')}</h1>
		<p>{$_('404.pageNotFound')}</p>
	</div>
</div>
