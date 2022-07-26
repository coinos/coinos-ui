<script>
	import '../app.css';
	import { onMount } from 'svelte';
  import { rate, ws } from "$lib/store";
  import { messages } from "$lib/socket";

	let token =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJvYiIsImlhdCI6MTY1ODc5NDkxMX0._zFTEADrbLffcXa5sIMrJtJ483VdIiYmsdt2ofibxu4';

	onMount(async () => {
		$ws = new WebSocket(`ws://localhost:3119/ws`);

		$ws.onmessage = (msg) => {
			let { type, data } = JSON.parse(msg.data);
      messages(data)[type] && messages(data)[type]();
		};

		$ws.onopen = () => {
			ws.send(JSON.stringify({ type: 'login', data: token }));
		};
	});
</script>

<slot />
