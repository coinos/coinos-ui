<script lang="ts">
  import { scale } from "svelte/transition";
  import { toast } from "@zerodevx/svelte-toast";
  import { t } from "$lib/translations";

  let { data } = $props();
  let { user } = data;
  toast.pop(0);
</script>

<div class="text-center mt-20 md:mt-0">
  <div class="flex w-full max-w-[200px] mx-auto py-20" in:scale={{ start: 0.5 }}>
    <iconify-icon noobserver icon="ph:check-bold" class="mx-auto w-full text-[#7ACC8F]"
    ></iconify-icon>
  </div>
  <h1 class="text-3xl md:text-4xl font-bold mb-6">Request Sent!</h1>
</div>

<a href={`/payments`} aria-label="Back to payments">
  <div class="opacity-0 w-screen h-screen fixed top-0 left-0 z-50"></div>
</a>

<div class="flex justify-center">{$t("payments.tapAnywhere")}</div>
