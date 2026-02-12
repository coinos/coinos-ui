<script lang="ts">
  import { goto } from "$app/navigation";
  import { send, sign } from "$lib/nostr";
  import { t } from "$lib/translations";
  import { focus } from "$lib/utils";

  let { data } = $props();
  let { user } = $derived(data);
  let { pubkey } = $derived(user);
  let content: string = $state("");

  let submit = async (e) => {
    try {
      e.preventDefault();

      let event = {
        kind: 1,
        content,
        created_at: Math.round(Date.now() / 1000),
        tags: [],
      };

      event = await sign(event, user);
      await send(event);

      goto(`/${user.username}/notes`);
    } catch (e) {
      console.log(e);
    }
  };
</script>

<div class="container px-4 max-w-xl mx-auto space-y-5">
  <form method="POST" class="space-y-2 text-xl" onsubmit={submit}>
    <textarea use:focus bind:value={content} placeholder={$t("notes.contents")}></textarea>
    <button type="submit" class="btn btn-accent">{$t("payments.submit")}</button>
  </form>
</div>
