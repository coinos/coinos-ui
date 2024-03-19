<script>
  export let id;
  export let value;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<label for={id} class="inline-flex relative items-center mr-5 cursor-pointer" on:click>
  <input
    type="checkbox"
    bind:checked={value}
    {id}
    name={id}
    class="sr-only peer"
  />
  <div
    class="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-stone-800 peer-focus:ring-4 peer-focus:ring-gray-300 dark:peer-focus:ring-gray-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"
  />
</label>
