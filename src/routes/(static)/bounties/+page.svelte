<script>
  import Avatar from "$comp/Avatar.svelte";
  import { s } from "$lib/utils";
  import Amount from "$comp/Amount.svelte";

  let { data } = $props();
  let { users } = data;

  let bounties = [
    "Clothing Store",
    "Hardware Store",
    "Gas Station",
    "Shoe Repair",
    "Dollar Store",
    "Book Store",
    "Gift Shop",
    "Game or Toy Store",
    "Pet Store",
    "Pharmacy",
  ];

  let small = [
    {
      type: "Restaurant",
      amount: 5000,
    },
    { type: "Cafe", amount: 3000 },
    { type: "Tradesperson or Professional", amount: 2500 },
    { type: "Food Truck", amount: 2000 },
    { type: "Farmer's Market Vendor", amount: 2000 },
  ];
</script>

<div class="space-y-5 pb-20">
  <h1 class="text-3xl mb-6 md:pt-12 font-bold">Coinos Bounties</h1>

  <p>Earn sats by referring us to local businesses in Vancouver!</p>

  <h2 class="text-2xl font-bold">Currently Available</h2>

  <div class="space-y-0">
    {#each bounties as b}
      <div class="flex max-w-xs sm:max-w-xl">
        <div>First {b}</div>

        <iconify-icon
          noobserver
          icon="ph:lightning-fill"
          class="text-yellow-300 ml-auto"
        ></iconify-icon>{s(10000, "en-CA")}
      </div>
    {/each}
  </div>

  <hr />

  <div class="space-y-0">
    {#each small as b}
      <div class="flex max-w-xs sm:max-w-xl">
        <div>{b.type}</div>

        <iconify-icon
          noobserver
          icon="ph:lightning-fill"
          class="text-yellow-300 ml-auto"
        ></iconify-icon>{s(b.amount, "en-CA")}
      </div>
    {/each}
  </div>

  <h2 class="text-2xl font-bold">Previously Awarded</h2>

  <div class="flex flex-col gap-4">
    {#each users as { user, merchant, type }}
      <article
        class="rounded-2xl border border-neutral-200 bg-white/70 p-4 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/60 sm:max-w-xl"
      >
        <div class="flex items-start gap-3 min-w-0 flex-wrap">
          <div class="shrink-0">
            <Avatar user={merchant} size={12} />
          </div>

          <div>
            <div class="flex items-center gap-2 min-w-0">
              <h3
                class="whitespace-wrap text-base font-semibold max-w-[150px] truncate sm:max-w-full"
                title={merchant.display || merchant.username}
              >
                <a href={`/${merchant.username}`}
                  >{merchant.display || merchant.username}</a
                >
              </h3>

              <span
                class="shrink-0 rounded-full border border-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
              >
                {type}
              </span>
            </div>

            <div
              class="mt-2 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300 min-w-0"
            >
              <Avatar {user} size={8} class="shrink-0" />
              <span class="truncate max-w-full"
                >Referred by @{user.username}</span
              >
            </div>
          </div>

          <div class="ml-auto flex shrink-0 items-center gap-1 whitespace">
            <iconify-icon
              noobserver
              icon="ph:lightning-fill"
              class="text-yellow-300"
            />
            <span class="text-sm font-semibold tabular-nums">
              {s(1000000, "en-CA")}
            </span>
          </div>
        </div>
      </article>
    {/each}
  </div>

  <h2 class="text-2xl font-bold">Terms and Conditions</h2>

  <p>One bounty per person</p>

  <div>Eligible businesses should:</div>

  <ul class="ml-4 space-y-0 list-disc">
    <li>Have a physical location in Greater Vancouver</li>
    <li>Take walk-ins without appointments</li>
    <li>Have a website with contact info</li>
    <li>Have at least a 3-star rating on Google</li>
  </ul>

  <div>They will be expected to:</div>

  <ul class="ml-4 space-y-0 list-disc">
    <li>Display a window sticker and QR</li>
    <li>Train staff on Bitcoin procedures</li>
    <li>Accept Bitcoin during posted business hours</li>
  </ul>

  <p>
    25% of the bounty will be awarded once the business is ready to take
    payments and has been announced
  </p>

  <p>
    The rest will be awarded once they've been accepting Bitcoin for 6 months
  </p>

  <p>Bounties will be awarded at our discretion</p>

  <p>
    We reserve the right to refuse applicants and change these terms without
    cause or notice
  </p>

  <h2 class="text-2xl font-bold">Get Started!</h2>

  <p>
    Reach out to <a
      href="mailto:bounties@coinos.io"
      class="text-blue-600 hover:underline">bounties@coinos.io</a
    > and let us know who we should contact
  </p>

  <p>
    We'll update this page as the bounties are claimed so you'll be able to see
    which ones are still available.
  </p>

  <p>
    Have a lead or idea for something that's not on the list? Reach out! We offer
    sats for all sorts of referrals!
  </p>

  <p>Thanks for participating and helping to orange pill Vancouver!</p>
</div>
