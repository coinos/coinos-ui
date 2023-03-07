<script>
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { Footer, LandingHeader } from '$comp';
	export let data;
	$: ({ user } = data);
</script>

<SvelteToast options={{ reversed: true, intro: { y: 192 } }} />
<LandingHeader {user} />
<main class="container flex px-10 md:px-40 mx-auto min-h-[600px] pb-20">
	<slot />
</main>
<Footer />
