<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<main class="min-h-dvh">
  {@render children?.()}
</main>
