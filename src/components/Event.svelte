<script>
  import { Avatar, Icon } from "$comp";
  export let event;

  let { id, user, seen, content } = event;

  let distance = (date) => {
    let m = 60;
    let h = 60 * m;
    let d = 24 * h;

    let diff = Math.round(Date.now() / 1000) - date;
    return diff > d
      ? Math.round(diff / d) + "d"
      : diff > h
      ? Math.round(diff / h) + "h"
      : diff > m
      ? Math.round(diff / m) + "m"
      : diff > 2
      ? diff + "s"
      : "now";
  };

  let w;
</script>

<svelte:window bind:innerWidth={w} />

<div
  class="flex text-sm lg:text-base text-secondary hover:bg-gray-100 px-4 py-3"
  :key={id}
>
  <a href={`/${user.pubkey}`}>
    <div class="mb-auto mr-2">
      <div class="md:hidden">
        <Avatar size={12} {user} disabled={true} />
      </div>
      <div class="hidden md:block">
        <Avatar size={20} {user} disabled={true} />
      </div>
    </div>
  </a>

  <div class="grow" style={`max-width: ${w - 100}px`}>
    <div class="w-full flex pb-1 text-black pt-1">
      <div>
        {user.display_name || ""}
        <span class="text-secondary">@{user.username}</span>
      </div>
      <div class="text-secondary">&nbsp;{distance(seen)}</div>
    </div>
    <div class="break-words text-black">
      {content}
    </div>

    <div class="flex justify-between text-sm text-secondary pt-3">
      <div class="flex group">
        <Icon
          icon="party"
          style="mr-1 w-10 my-auto opacity-50 group-hover:opacity-100 group-hover:bg-white rounded-full p-2"
        />
        <div class="my-auto group-hover:text-black">444</div>
      </div>
      <div class="flex group">
        <Icon
          icon="support"
          style="mr-1 w-10 my-auto opacity-50 group-hover:opacity-100 group-hover:bg-white rounded-full p-2"
        />
        <div class="my-auto group-hover:text-black">1072</div>
      </div>
      <div class="flex group">
        <Icon
          icon="smile"
          style="mr-1 w-10 my-auto opacity-50 group-hover:opacity-100 group-hover:bg-white rounded-full p-2"
        />
        <div class="my-auto group-hover:text-black">26</div>
      </div>
      <div class="flex group">
        <Icon
          icon="bolt"
          style="mr-1 h-10 my-auto opacity-50 group-hover:opacity-100 group-hover:bg-white rounded-full p-2"
        />
        <div class="my-auto group-hover:text-black">4</div>
      </div>
    </div>
  </div>
</div>
