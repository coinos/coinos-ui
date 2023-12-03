<script>
  import RegisterOrLogin from "$comp/RegisterOrLogin.svelte";
  import { onMount } from "svelte";

  onMount(() => {
    $pin = undefined;
    localStorage.clear();
    sessionStorage.clear();
  });

  export let form;
</script>

<RegisterOrLogin pageID="signIn" bind:form />
