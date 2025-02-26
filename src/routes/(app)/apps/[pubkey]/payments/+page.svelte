<script>
  import { loc } from "$lib/utils";
  import Payments from "$comp/Payments.svelte";
  import { t } from "$lib/translations";

  let { data } = $props();
  let { app, user } = $derived(data);
  let locale = loc(user);
  let { payments } = $derived(app);
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl md:text-4xl font-semibold">
    {$t("payments.header")}
  </h1>

  <div class="container w-full mx-auto text-lg px-2 max-w-xl space-y-2">
    <Payments {payments} {locale} {user} />
  </div>
</div>
