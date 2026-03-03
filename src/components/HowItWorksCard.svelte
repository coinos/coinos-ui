<script>
  import CoinosHand from "virtual:icons/coinos/hand";
  import CoinosBolt from "virtual:icons/coinos/bolt";
  import CoinosSmile from "virtual:icons/coinos/smile";
  import { t } from "$lib/translations";
  let { image, stepID, size = 128 } = $props();

  const iconMap = {
    "coinos:hand": CoinosHand,
    "coinos:bolt": CoinosBolt,
    "coinos:smile": CoinosSmile,
  };

  let Icon = $derived(iconMap[image]);
</script>

<div class="space-y-5">
  <div class="h-32 flex items-center justify-center">
    <Icon class="mx-auto" width={String(size)} />
  </div>
  <p class="text-2xl font-medium">{$t("howItWorks." + stepID + ".header")}</p>
  <p class="text-secondary text-xl font-medium w-full md:w-2/3 mx-auto">
    {$t("howItWorks." + stepID + ".description")}
  </p>
</div>
