<script>
  import Left from "$comp/Left.svelte";
  import Icon from "$comp/Icon.svelte";
  import { focus, post, warning } from "$lib/utils";
  import { t } from "$lib/translations";

  let { v = $bindable(), cancel } = $props();

  let arrow = "<";
  let loading = false;

  const numPad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "<"];

  const handleInput = (e, n) => {
    e.preventDefault();
    e.stopPropagation();

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

  let hide = $state(true);

  let toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    hide = !hide;
  };
</script>

<label
  class="input input-bordered border-primary input-lg rounded-2xl flex items-center gap-2"
>
  {#if hide}
    <input
      onkeydown={validate}
      use:focus
      bind:value={v}
      type="password"
      class="clean text-center !text-5xl !w-96 block"
      pattern="[0-9]+"
      placeholder="_ _ _ _ _ _"
    />
  {:else}
    <input
      onkeydown={validate}
      use:focus
      bind:value={v}
      class="clean text-center !text-5xl !w-96 block"
      type="text"
      pattern="[0-9]+"
      placeholder="_ _ _ _ _ _"
    />
  {/if}
  <button type="button" class="contents" onclick={toggle}>
    <iconify-icon noobserver icon={hide ? "ph:eye-slash-bold" : "ph:eye-bold"} width="32"
    ></iconify-icon></button
  >
</label>

<div class="grid grid-cols-3 gap-2 w-[300px] mx-auto grayscale">
  {#each numPad as value}
    {#if value === arrow}
      <button type="button" class="btn" onclick={(e) => handleInput(e, value)}>
        <Left />
      </button>
    {:else}
      <button type="button" class="btn" onclick={(e) => handleInput(e, value)}
        >{value}</button
      >
    {/if}
  {/each}
</div>
