<script lang="ts">
  import { browser } from "$app/environment";
  import { scale } from "svelte/transition";
  import Amount from "$comp/Amount.svelte";
  const { amount, tip = undefined, rate, currency, locale, title = "" }: any = $props();

  let ConfettiComp: any = $state(null);
  let loaded = $state(false);
  $effect(() => {
    if (browser)
      window.requestAnimationFrame((p) => {
        loaded = true;
      });
  });

  $effect(() => {
    if (!browser || !loaded || ConfettiComp) return;
    (async () => {
      const mod = await import("svelte-confetti");
      ConfettiComp = mod.Confetti;
    })();
  });
</script>

<div class="text-center mt-20 md:mt-0">
  {#if loaded}
    <div class="relative flex justify-center">
      <div class="absolute top-64 pointer-events-none">
        {#if ConfettiComp}
          <ConfettiComp
            amount="20"
            size="40"
            duration="1600"
            delay={[0, 500]}
            fallDistance="50px"
            colorArray={["url(/images/bolt.svg)"]}
          />
          <ConfettiComp
            amount="40"
            delay={[0, 500]}
            size="15"
            fallDistance="50px"
            duration="1600"
            colorArray={[
              "#FFD700", // Gold
              "#FF6F61", // Coral
              "#6BCB77", // Mint green
              "#4D96FF", // Light blue
              "#FF9CEE", // Light pink
              "#FFD580", // Soft orange
              "#87CEEB", // Sky blue
              "#FFB6C1", // Light coral pink
              "#C1C7FF", // Lavender
            ]}
          />
        {/if}
      </div>
    </div>

    <iconify-icon noobserver
      icon="ph:check-fat-fill"
      class="text-green-400"
      width="160"
      in:scale={{ start: 0.2, duration: 500 }}
    ></iconify-icon>
  {/if}
  <h1 class="text-3xl md:text-4xl font-bold mb-6">{title}</h1>
  <Amount {amount} {tip} {rate} {currency} {locale} />
</div>
