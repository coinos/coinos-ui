<script>
  import Avatar from "$comp/Avatar.svelte";
  import Icon from "$comp/Icon.svelte";
  import { request } from "$lib/store";
</script>

Invoice sent to
<div class="flex">
  <Avatar user={$request.requester} size={12} />
  <h1 class="my-auto"><b>{$request.requester.username}</b> is ready to pay</h1>
</div>
