<script>
  import { avatar, banner } from "$lib/store";
  import Icon from "$comp/Icon.svelte";
  import { punk } from "$lib/utils";

  export let user;
  export let size = 32;
  export let disabled = false;

  $: s = size.toString();
  $: link = user?.anon ? `/${user.pubkey}` : `/${user.username}`;

  let base = "/api/public";
  $: profile = user?.profile ? `${base}/${user.profile}.webp` : user?.picture;
  $: fallback = `${base}/punks/` + punk(user.pubkey || user.id || "aa");
  $: tmp = $avatar?.id && $avatar.id === user.id && $avatar.src;
  $: src = tmp || profile || fallback;

  let handle = () => (src = fallback);
</script>

<a href={link} class:pointer-events-none={disabled}>
  <div
    class="w-{s} h-{s} rounded-full border-4 border-base-100 overflow-hidden bg-gradient-to-r from-primary to-gradient flex justify-center items-center"
  >
    <img
      {src}
      class="w-full h-full object-cover object-center overflow-hidden"
      alt={user.username}
      on:error={handle}
    />
  </div>
</a>
