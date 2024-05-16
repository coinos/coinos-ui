<script>
	import { Qr as Q } from '$comp';

	import Qr from 'qrcode-base64';
	let username = 'milano';
	let src = Qr.drawImg(`https://coinos.io/${username}`, { size: 4000 });
</script>

<div class="border-8 border-black p-8 w-[710px] mx-auto mt-20">
	<div class="flex gap-2 mx-auto justify-center">
		<img src="/images/bitcoin.png" class="w-16" />
		<h3 class="text-4xl font-bold text-center my-auto">Bitcoin Accepted Here</h3>
	</div>
	<Q {src} />
	<div class="text-center text-5xl font-bold">coinos.io/{username}</div>
	<div class="flex w-full justify-center gap-4 mt-10">
		<img src="/images/logo.png" class="ml-auto my-auto" style="width: 180px" />
	</div>
</div>
