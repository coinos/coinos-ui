<script lang="ts">
  import PhTrashBold from "virtual:icons/ph/trash-bold";
  import PhPlusBold from "virtual:icons/ph/plus-bold";
  import PhArrowLeftBold from "virtual:icons/ph/arrow-left-bold";
  import { focus, fail, post } from "$lib/utils";
  import { enhance } from "$app/forms";
  import { t } from "$lib/translations";
  import Avatar from "$comp/Avatar.svelte";

  let { data } = $props();
  let { id, managers } = $derived(data);
  let m = $state((() => data.managers)());
  $effect(() => (m = data.managers));
  let username = $state();
  let del = async (e, user) => {
    e.preventDefault();
    try {
      m = await post(`/api/fund/${id}/managers/delete`, {
        id: user.id,
      });
    } catch (e: any) {
      fail(e.message);
    }
  };
</script>

<div class="container px-4 max-w-4xl mx-auto mt-10 space-y-5">
  <div class="flex justify-center items-center">
    <div class="md:shadow-xl rounded-3xl md:px-10 pt-5 pb-10 space-y-5 w-full md:mx-5">
      <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">Fund managers</h1>

      {#each m as c}
        <a href={`/${c.username}`} class="contents">
          <div class="flex hover:bg-base-200 p-2 items-center">
            <Avatar user={c} size={20} disabled={true} />
            <div class="my-auto text-left">
              <p class="ml-1 text-lg break-words">{c.username}</p>
            </div>
            <button
              type="button"
              onclick={(e) => del(e, c)}
              class="ml-auto"
              aria-label={`Remove ${c.username}`}
            >
              <PhTrashBold width="32" />
            </button>
          </div>
        </a>
      {/each}

      <form method="post" use:enhance class="space-y-2">
        <input type="hidden" name="id" value={id} />
        <input use:focus name="username" bind:value={username} placeholder={$t("funds.username")} class="input" />
        <button type="submit" class="btn">
          <PhPlusBold width="32" />
          {$t("funds.addManager")}
        </button>
      </form>

      <a href={`/fund/${id}`} class="btn">
        <PhArrowLeftBold width={32} />
        {$t("funds.returnToFund")}
      </a>
    </div>
  </div>
</div>
