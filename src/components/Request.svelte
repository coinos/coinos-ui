<script>
	import { Avatar } from '$comp';
	import { request } from '$lib/store';
</script>

<div class="fixed bottom-0 h-24 border-t w-full bg-primary" in:fly>
	<Avatar user={$request.requester} />
	{$request.requester.username} is requesting an invoice
</div>
