<script>
  import { browser } from "$app/environment";
  import { scale } from "svelte/transition";
  import Amount from "$comp/Amount.svelte";
  import { Confetti } from "svelte-confetti";
  const { amount, tip, rate, currency, title } = $props();

  let loaded = $state(false);
  $effect(() => {
    if (browser)
      window.requestAnimationFrame((p) => {
        loaded = true;
      });
  });
</script>

<div class="text-center mt-20 md:mt-0">
  {#if loaded}
    <div class="relative flex justify-center">
      <div class="absolute top-64 pointer-events-none">
        <Confetti
          amount="20"
          size="40"
          duration="1600"
          delay={[0, 500]}
          fallDistance="50px"
          colorArray={["url(/images/bolt.svg)"]}
        />
        <Confetti
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
      </div>
    </div>

    <iconify-icon
      icon="ph:check-fat-fill"
      class="text-green-400"
      width="160"
      in:scale={{ start: 0.2, duration: 500 }}
    ></iconify-icon>
  {/if}
  <h1 class="text-3xl md:text-4xl font-bold mb-6">{title}</h1>
  <Amount {amount} {tip} {rate} {currency} />
</div>
