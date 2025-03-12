<script>
  import Avatar from "$comp/Avatar.svelte";

  let { data } = $props();
  let { managers } = $derived(data);
</script>

<div class="container px-4 max-w-4xl mx-auto mt-10 space-y-5">
  <div class="flex justify-center items-center">
    <div
      class="md:shadow-xl rounded-3xl md:px-10 pt-5 pb-10 space-y-5 w-full md:mx-5"
    >
      <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
        Fund managers
      </h1>

      {#each managers as c}
        <a href={`/pay/${c.username}`} class="contents">
          <div class="flex hover:bg-base-200 p-2">
            <Avatar user={c} size={20} disabled={true} />
            <div class="my-auto text-left">
              <p class="ml-1 text-lg break-words">{c.username}</p>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>
</div>
