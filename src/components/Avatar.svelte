<script lang="ts">
  import { run } from 'svelte/legacy';

  import { avatar, banner } from "$lib/store";
  import Icon from "$comp/Icon.svelte";
  import { punk } from "$lib/utils";

  interface Props {
    user: any;
    size?: number;
    disabled?: boolean;
  }

  let { user, size = 32, disabled = false }: Props = $props();

  let s = $derived(size.toString());
  let link = $derived(user?.anon ? `/${user.pubkey}` : `/${user.username}`);

  let base = "/api/public";
  let profile = $derived(user?.profile ? `${base}/${user.profile}.webp` : user?.picture);
  let fallback = $derived(`${base}/punks/` + punk(user.pubkey || user.id || "aa"));
  let tmp = $derived($avatar?.id && $avatar.id === user.id && $avatar.src);
  let src;
  run(() => {
    src = tmp || profile || fallback;
  });

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
      onerror={handle}
    />
  </div>
</a>
