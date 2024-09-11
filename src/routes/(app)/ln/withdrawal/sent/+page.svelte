<script>
  import { scale } from "svelte/transition";
  import Icon from "$comp/Icon.svelte";
  import { toast } from "@zerodevx/svelte-toast";
  import { t } from "$lib/translations";

  export let data;
  let { user } = data;
  toast.pop(0);
</script>

<div class="text-center mt-20 md:mt-0">
  <div
    class="flex w-full max-w-[200px] mx-auto py-20"
    in:scale={{ start: 0.5 }}
  >
    <Icon icon="check" style="mx-auto" />
  </div>
  <h1 class="text-3xl md:text-4xl font-bold mb-6">Request Sent!</h1>
</div>

<a href={`/payments`}>
  <div class="opacity-0 w-screen h-screen fixed top-0 left-0 z-50" />
</a>

<div class="fixed bottom-10 w-full text-center">
  {$t("payments.tapAnywhere")}
</div>
