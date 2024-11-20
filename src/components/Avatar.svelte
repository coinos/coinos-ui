<script lang="ts">
  import { avatar, banner } from "$lib/store";
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
  let profile = $derived(
    user?.profile ? `${base}/${user.profile}.webp` : user?.picture,
  );
  let fallback = $derived(
    `${base}/punks/` + punk(user.pubkey || user.id || "aa"),
  );
  let tmp = $derived($avatar?.id && $avatar.id === user.id && $avatar.src);
  let src = $derived(tmp || profile || fallback);
</script>

{#snippet body()}
  <div
    class="w-{s} h-{s} rounded-full border-4 border-base-100 overflow-hidden bg-gradient-to-r from-primary to-gradient flex justify-center items-center"
  >
    <img
      {src}
      class="w-full h-full object-cover object-center overflow-hidden"
      alt={user.username}
    />
  </div>
{/snippet}

{#if disabled}
  {@render body()}
{:else}
  <a href={link} class:pointer-events-none={disabled}>
    {@render body()}
  </a>
{/if}
