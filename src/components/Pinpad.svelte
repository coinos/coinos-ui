<script>
  import Left from "$comp/Left.svelte";
  import Icon from "$comp/Icon.svelte";
  import { focus, post, warning } from "$lib/utils";
  import { t } from "$lib/translations";

  export let v;
  export let cancel;

  let arrow = "<";
  let loading = false;

  const numPad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "<"];

  const handleInput = (n) => {
    v = (v || "").toString();
    if (n === "C") return (v = "");
    if (n === "<") return (v = v.length > 1 ? Math.floor(v / 10) : "");
    if (v.length > 5) n = "";
    if (parseInt(n) >= 0) v += n;
  };

  let validate = (e) => {
    let k = e.key || e.code;
    if (k === "Escape") cancel();
    if (
      e.key.length <= 1 &&
      !(e.metaKey || e.ctrlKey || e.altKey) &&
      !(k >= "0" && k <= "9")
    ) {
      if (e.preventDefault) e.preventDefault();
      else e.returnValue = false;
    }
  };

  let hide = true;
</script>

<label
  class="input input-bordered border-primary input-lg rounded-2xl flex items-center gap-2"
>
  {#if hide}
    <input
      on:keydown={validate}
      use:focus
      bind:value={v}
      type="password"
      class="blank text-center !text-5xl !w-96 block"
      pattern="[0-9]+"
    />
  {:else}
    <input
      on:keydown={validate}
      use:focus
      bind:value={v}
      class="blank text-center !text-5xl !w-96 block"
      type="text"
      pattern="[0-9]+"
    />
  {/if}
  <iconify-icon
    icon={hide ? "ph:eye-slash-bold" : "ph:eye-bold"}
    width="32"
    on:click|stopPropagation|preventDefault={() => (hide = !hide)}
    class="cursor-pointer"
  />
</label>

<div class="grid grid-cols-3 gap-2 w-[300px] mx-auto grayscale">
  {#each numPad as value}
    {#if value === arrow}
      <button
        type="button"
        class="btn"
        on:click|stopPropagation|preventDefault={() => handleInput(value)}
      >
        <Left />
      </button>
    {:else}
      <button
        type="button"
        class="btn"
        on:click|stopPropagation|preventDefault={() => handleInput(value)}
        >{value}</button
      >
    {/if}
  {/each}
</div>
