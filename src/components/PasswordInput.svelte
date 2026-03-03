<script lang="ts">
  import PhEyeBold from "virtual:icons/ph/eye-bold";
  import PhEyeSlashBold from "virtual:icons/ph/eye-slash-bold";
  let {
    name = $bindable("password"),
    show = $bindable(),
    value = $bindable(),
    focus = () => {},
    placeholder = undefined,
  } = $props();

  let toggle = (e) => {
    e?.preventDefault();
    show = !show;
  };
</script>

<label for="password" class="input flex items-center justify-center gap-2 w-full">
  {#if show}
    <input {name} type="text" bind:value class="clean" {placeholder} />
  {:else}
    <input {name} type="password" bind:value class="clean" use:focus {placeholder} />
  {/if}
  <button type="button" aria-label="Toggle" onclick={toggle} class="contents">
    {#if show}
      <PhEyeBold width="32" />
    {:else}
      <PhEyeSlashBold width="32" />
    {/if}
  </button>
</label>
