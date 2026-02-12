<script lang="ts">
  import Avatar from "$comp/Avatar.svelte";
  import { request } from "$lib/store";
</script>

Invoice sent to
<div class="flex">
  <Avatar user={($request as any).requester} size={12} />
  <h1 class="my-auto">
    <b>{($request as any).requester.username}</b>
    is ready to pay
  </h1>
</div>
