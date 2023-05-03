<script>
	import { Icon } from '$comp';
  import { ONRAMPER } from '$env/static/private';
</script>

<div class="container px-4 max-w-xl mx-auto mt-10 space-y-5">
	<div class="w-full flex">
		<a href="/" class="mx-auto">
			<Icon icon="logo" />
		</a>
	</div>

	<div class="flex justify-center items-center">
		<div class="shadow-xl rounded-3xl px-10 pt-5 pb-10 space-y-5 w-full mx-5">
			<iframe
				style="border-radius: 4px; border: 1px solid #58585f; margin: auto;max-width: 420px"
      src={`https://buy.onramper.com/?apiKey=${ONRAMPER}`}
				height="630px"
				width="420px"
				title="Onramper widget"
				allow="accelerometer; autoplay; camera; gyroscope; payment"
			/>
		</div>
	</div>
</div>
