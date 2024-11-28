<script>
  let {
    name = $bindable("password"),
    show = $bindable(),
    value = $bindable(),
    focus = () => {},
    placeholder,
  } = $props();
  let toggle = (e) => (show = !show);
  let icon = $derived(show ? "ph:eye-bold" : "ph:eye-slash-bold");
</script>

<label
  for="password"
  class="input flex items-center justify-center gap-2 w-full"
>
  {#if show}
    <input {name} type="text" bind:value class="clean" {placeholder} />
  {:else}
    <input
      {name}
      type="password"
      bind:value
      class="clean"
      use:focus
      {placeholder}
    />
  {/if}
  <button type="button" aria-label="Toggle" onclick={toggle} class="contents">
    <iconify-icon {icon} width="32"></iconify-icon>
  </button>
</label>
