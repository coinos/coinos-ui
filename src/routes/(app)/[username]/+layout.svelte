<script>
  import AppHeader from "$comp/AppHeader.svelte";
  import { onNavigate } from "$app/navigation";
  export let data;

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<AppHeader {data} />
<div class="content">
  <slot />
</div>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }

  @keyframes fade-out {
    to {
      opacity: 0;
    }
  }

  @keyframes slide-from-right {
    from {
      transform: translateX(60px);
    }
  }

  @keyframes slide-to-left {
    to {
      transform: translateX(-60px);
    }
  }

  :root::view-transition-old(root) {
    animation: 280ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
      180ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
  }

  :root::view-transition-new(root) {
    animation: 280ms cubic-bezier(0, 0, 0.2, 1) 80ms both fade-in,
      180ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
  }
</style>