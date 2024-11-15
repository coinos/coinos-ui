<script lang="ts">
  import { run } from "svelte/legacy";

  import LandingHeader from "$comp/LandingHeader.svelte";
  import LandingHero from "$comp/LandingHero.svelte";
  import LandingInfoCard from "$comp/LandingInfoCard.svelte";
  import HowItWorksCard from "$comp/HowItWorksCard.svelte";
  import FaqCard from "$comp/FaqCard.svelte";
  import Image from "$comp/Image.svelte";
  import Footer from "$comp/Footer.svelte";
  import About from "$comp/About.svelte";

  import { locale, t } from "$lib/translations";
  import { onDestroy, onMount, tick } from "svelte";

  let { data } = $props();
  let { faqs, locations, user } = $state(data);
  let update = (data) => ({ faqs, locations, user } = data);
  run(() => {
    update(data);
  });

  let howItWorks = $state();
  let faq = $state();
  let about = $state();

  const howItWorksSteps = [
    { image: "coinos:hand", stepID: "step1" },
    { image: "coinos:bolt", stepID: "step2" },
    { image: "coinos:smile", stepID: "step3" },
  ];

  let loaded = $state();

  let observer;

  onMount(async () => {
    loaded = true;
  });

  onDestroy(() => (loaded = false));
</script>

{#if loaded}
  <LandingHeader {howItWorks} {faq} {about} {user} />

  <main class="space-y-40 py-20 md:py-32 lg:py-36 xl:py-40 px-5 md:px-0">
    <LandingHero />
    <LandingInfoCard
      image="lightning-qr"
      title={$t("landing.info1.title")}
      description={$t("landing.info1.description")}
    />

    <LandingInfoCard
      image="phone-checkout"
      title={$t("landing.info2.title")}
      order="reverse"
    >
      {$t("landing.info2.description1")}
      <br /><br />
      {$t("landing.info2.description2")}
      <br /><br />
      {@html $t("landing.info2.description3")}
    </LandingInfoCard>

    <div>
      <LandingInfoCard
        image="customize"
        title={$t("landing.info3.title")}
        description={$t("landing.info3.description")}
      />
      <div bind:this={howItWorks}></div>
      <div id="about"></div>
    </div>

    <div>
      <h3 class="text-5xl font-medium mb-10 text-center">
        {$t("howItWorks.header")}
      </h3>
      <div class="grid lg:grid-cols-3 space-y-10 lg:space-y-0 text-center">
        {#each howItWorksSteps as step}
          <HowItWorksCard image={step.image} stepID={step.stepID} />
        {/each}
      </div>
      <div bind:this={faq}></div>
    </div>

    <div>
      <div class="space-y-10">
        <h3 class="text-5xl font-medium text-center pt-40 -mt-40" id="faq">
          {$t("faq.header")}
        </h3>
        {#each faqs as f}
          <FaqCard questionID={f} />
        {/each}
      </div>
      <div bind:this={about}></div>
    </div>

    <About />
  </main>

  <Footer />
{/if}
