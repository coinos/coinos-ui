<script>
  import LandingHeader from "$comp/LandingHeader.svelte";
  import LandingHero from "$comp/LandingHero.svelte";
  import LandingInfoCard from "$comp/LandingInfoCard.svelte";
  import HowItWorksCard from "$comp/HowItWorksCard.svelte";
  import FaqCard from "$comp/FaqCard.svelte";
  import Image from "$comp/Image.svelte";
  import Footer from "$comp/Footer.svelte";

  import { locale, t } from "$lib/translations";
  import { onDestroy, onMount, tick } from "svelte";

  export let data;
  let { faqs, locations, user } = data;
  let update = (data) => ({ faqs, locations, user } = data);
  $: update(data);

  let howItWorks;
  let faq;
  let about;

  let log = console.log;

  const howItWorksSteps = [
    { image: "hand", stepID: "step1" },
    { image: "bolt", stepID: "step2" },
    { image: "smile", stepID: "step3" },
  ];

  let loaded;

  let observer;
  let isIntersecting = false;

  let About;
  onMount(async () => {
    observer = new IntersectionObserver(async (entries) => {
      About = (await import("$comp/About.svelte")).default;
      isIntersecting = isIntersecting || entries[0].isIntersecting;
    });

    loaded = true;

    await tick();
    observer.observe(document.getElementById("faq"));
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
      <div bind:this={howItWorks} />
      <div id="about" />
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
      <div bind:this={faq} />
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
      <div bind:this={about} />
    </div>

    {#if isIntersecting}
      <About />
    {/if}
  </main>

  <Footer />
{/if}
