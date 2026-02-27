<script lang="ts">
  import DarkToggle from "$comp/DarkToggle.svelte";
  import LocaleSelector from "$comp/LocaleSelector.svelte";
  import { t } from "$lib/translations";

  const followLinks = [
    {
      url: "nostr:nprofile1qy28wue69uhnzv3h9cczuvpwxyargwpk8yhszxrhwvaz7tmhda6zucnjd9nksarzdak8gtnwv46z7qpqw27mc4aa6m0ufe3xs5z3m6qyr52gc0rglept7vqlwx4xeaf72tasv5xyqv",
      titleID: "nostr",
    },
    { url: "https://t.me/coinoswallet", titleID: "telegram" },
  ];

  const companyLinks = [
    { url: "/docs", titleID: "documentation" },
    { url: "/support", titleID: "support" },
  ];
</script>

<footer class="space-y-10 md:space-y-0 text-xl block md:flex justify-around pb-8 px-4">
  <div class="space-y-5">
    <div class="text-center w-full hidden md:block">
      <a href="/" aria-label="Home">
        <iconify-icon noobserver icon="coinos:logo" width="224"></iconify-icon>
      </a>
    </div>
    <div class="w-full sm:hidden">
      <a href="/register">
        <button class="btn btn-accent w-full text-2xl">{$t("nav.startInSeconds")}</button>
      </a>
    </div>
    <div class="w-full hidden sm:flex gap-2 justify-center items-center">
      <DarkToggle />
    </div>
  </div>

  <div class="text-center md:text-left">
    <p class="font-semibold">{$t("footer.followUs")}</p>
    <ul class="mt-5 text-secondary space-y-3 font-medium">
      {#each followLinks as link}
        <li>
          <a href={link.url} target="_blank" rel="noreferrer" class="hover:opacity-80">
            {$t("footer." + link.titleID)}
          </a>
        </li>
      {/each}
    </ul>
  </div>

  <div class="text-center md:text-left">
    <p class="font-semibold">{$t("footer.company")}</p>
    <ul class="mt-5 text-secondary space-y-3">
      {#each companyLinks as link}
        <li>
          <a href={link.url} class="hover:opacity-80">{$t("footer." + link.titleID)}</a>
        </li>
      {/each}
    </ul>
  </div>

  <div class="space-y-5">
    <div class="flex justify-center">
      <LocaleSelector />
    </div>
    <iconify-icon noobserver icon="coinos:shield" class="flex justify-center" width="96"
    ></iconify-icon>
  </div>
</footer>
