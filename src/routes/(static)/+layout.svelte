<script>
	import { Footer, LandingHeader } from '$comp';
</script>

<LandingHeader />
<main class="container flex px-10 md:px-40 mx-auto min-h-[600px] pb-20">
	<slot />
</main>
<Footer />
