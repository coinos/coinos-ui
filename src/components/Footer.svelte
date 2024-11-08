<script>
  import DarkToggle from "$comp/DarkToggle.svelte";
  import LocaleSelector from "$comp/LocaleSelector.svelte";
  import { t } from "$lib/translations";

  const followLinks = [
    {
      url: "nostr:nprofile1qqst4qyeqenw7zm0fwjsty68h6cnys5jre2xd8ngqpjv5a2j26s78fspz4mhxue69uhhyetvv9ujucm0d9hx7uewd9hsgwx239",
      titleID: "nostr",
    },
    { url: "https://t.me/coinoswallet", titleID: "telegram" },
    { url: "https://linktr.ee/coinos.io", titleID: "linktree" },
  ];

  const companyLinks = [
    { url: "/docs", titleID: "documentation" },
    { url: "/support", titleID: "support" },
  ];
</script>

<footer
  class="space-y-10 md:space-y-0 text-xl block md:flex justify-around pb-8 px-4"
>
  <div class="space-y-5">
    <div class="text-center w-full">
      <a href="/">
        <iconify-icon icon="coinos:logo" width="224"></iconify-icon>
      </a>
    </div>
    <div class="flex gap-2 justify-center sm:hidden">
      <div>
        <a href="/register">
          <button class="btn">
            {$t("nav.startInSeconds")}
          </button>
        </a>
      </div>
    </div>
    <div
      class="w-full flex flex-wrap sm:flex-nowrap gap-2 justify-center items-center"
    >
      <DarkToggle />
      <LocaleSelector />
    </div>
  </div>

  <div class="text-center md:text-left">
    <p class="font-semibold">{$t("footer.followUs")}</p>
    <ul class="mt-5 text-secondary space-y-3 font-medium">
      {#each followLinks as link}
        <li>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            class="hover:opacity-80">{$t("footer." + link.titleID)}</a
          >
        </li>
      {/each}
    </ul>
  </div>

  <div class="text-center md:text-left">
    <p class="font-semibold">{$t("footer.company")}</p>
    <ul class="mt-5 text-secondary space-y-3">
      {#each companyLinks as link}
        <li>
          <a href={link.url} class="hover:opacity-80"
            >{$t("footer." + link.titleID)}</a
          >
        </li>
      {/each}
    </ul>
  </div>

  <iconify-icon icon="coinos:shield" class="flex justify-center" width="96"></iconify-icon>
</footer>
