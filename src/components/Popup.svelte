<script>
  import { page } from "$app/stores";
  import Avatar from "$comp/Avatar.svelte";
  let { tags } = $props();

  let addr = (tags) => {
    let {
      "addr:housenumber": house,
      "addr:street": street,
      "addr:city": city,
    } = tags;
    if (house) return `${house} ${street}`;
    return "";
  };
</script>

{#if tags}
  {#if tags.user && tags.user.username}
    <a href={`/${tags.user.username}`}>
      <div class="space-y-5">
        <div>
          <span class="block font-bold">{tags.name}</span>
          <span class="block">{addr(tags)}</span>
        </div>

        <div>
          <div class="flex w-full">
            <div class="mx-auto">
              <Avatar user={tags.user} size={16} />
            </div>
          </div>
          <div class="break-all text-center">
            {$page.url.host}/{tags.user.username.toLowerCase()}
          </div>
        </div>
      </div>
    </a>
  {:else}
    <span class="block font-bold">{tags.name}</span>
    <span class="block">{addr(tags)}</span>
  {/if}
{/if}
