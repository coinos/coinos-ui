<script>
  import { t } from "$lib/translations";
  import { upload } from "$lib/upload";
  export let item, token;

  let fileInput, formElement, file;
  let select = () => fileInput.click();
  let src;

  let tooLarge = {};
  let handleFile = async ({ target }, type) => {
    tooLarge[type] = false;
    file = target.files[0];
    if (!file) return;

    if (file.size > 10000000) return (tooLarge[type] = true);

    var reader = new FileReader();
    reader.onload = async (e) => {
      src = e.target.result;
    };

    reader.readAsDataURL(file);
  };

  async function handleSubmit() {
    try {
      submitting = true;
      let data = new FormData(formElement);

      if (src) {
        try {
          let { hash } = JSON.parse(
            await upload(file, "item", progress, token)
          );

          data.set("image", hash);

          await fetch(`/api/public/${hash}.webp`, {
              cache: "reload",
            mode: "no-cors",
          });
        } catch (e) {
          console.log("problem upsubmitting avatar", e);
        }
      }

      const response = await fetch(formElement.action, {
        method: "POST",
        body: data,
      });

      const result = deserialize(await response.text());

      applyAction(result);
    } catch (e) {
      console.log(e);
      fail("Something went wrong");
    }

    submitting = false;
  }
</script>

<form
  method="POST"
  class="space-y-5"
  on:submit|preventDefault={handleSubmit}
  bind:this={formElement}
>
  <div>
    <label for="name" class="font-bold mb-1 block">{$t("items.name")}</label>
    <input name="name" bind:value={item.name} />
  </div>
  <div>
    <label for="img" class="font-bold mb-1 block">{$t("items.image")}</label>
    <div class="relative w-full h-64">
      {#if item.hash}
        <img
          src={`/api/public/${item.hash}.webp`}
          alt={item.name}
          class="mx-auto object-cover h-full w-full"
        />
      {:else if src}
        <img {src} alt={item.name} class="mx-auto object-cover h-full w-full" />
      {:else}
        <div
          class="bg-gradient-to-r from-primary to-gradient w-full h-48 mb-4 cursor-pointer hover:opacity-80"
          on:click={select}
          on:keydown={select}
          alt="Banner"
        />
      {/if}
      <input
        type="file"
        class="hidden"
        bind:this={fileInput}
        on:change={(e) => handleFile(e, "item")}
      />
    </div>
  </div>

  <button
    class="rounded-full py-5 px-6 font-bold hover:opacity-80 flex bg-black text-white text-2xl"
  >
    {$t("items.submit")}
  </button>
</form>
