<script>
	export let value,
		handle,
		min = 0,
		max = 100;
</script>

<input
	id="slider"
	type="range"
	{min}
	{max}
	bind:value
	class="px-0 py-0 my-5"
	style="--bgPercent: {((value - min) * 100) / (max - min)}%;"
	on:input={handle}
/>

<style>
	#slider {
		-webkit-appearance: none;
		width: 100%;
		height: 6px;
		border-radius: 5px;
		background: linear-gradient(
			to right,
			black 0%,
			black var(--bgPercent),
			#f5f7fa var(--bgPercent),
			#f5f7fa 100%
		);
		outline: none;
	}

	#slider:active {
		background-color: black;
	}

	#slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background: black;
		cursor: pointer;
	}

	#slider::-moz-range-thumb {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background: black;
		cursor: pointer;
	}
</style>
