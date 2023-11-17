<script>
	import { Icon, LocationsMap } from '$comp';
	export let data;

	let { locations } = data;
</script>

<div class="pt-4">
	<div class="w-[243px] mx-auto mb-10">
		<a href="/">
			<Icon icon="logo" />
		</a>
	</div>

	<div class="flex justify-center items-center">
		<LocationsMap {locations} />
	</div>
</div>
