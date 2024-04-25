<script>
  import { t } from "$lib/translations";
  import { upload } from "$lib/upload";
  import { fail } from "$lib/utils";
  import { applyAction, deserialize } from "$app/forms";
  import Spinner from "$comp/Spinner.svelte";
  export let item;
  export let user;

  let fileInput, formElement, file, submitting, progress;
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
          let { hash } = JSON.parse(await upload(file, "item", progress));

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
  <input type="hidden" name="id" bind:value={item.id} />
  <input type="hidden" name="image" bind:value={item.image} />

  <div>
    <label for="name" class="font-bold mb-1 block">{$t("items.name")}</label>
    <input name="name" bind:value={item.name} class="bg-black text-white" />
  </div>

  <div>
    <label for="price" class="font-bold mb-1 block">{$t("items.price")}</label>
    <div class="flex">
      <input
        name="price"
        bind:value={item.price}
        class="border-r-none rounded-r-none bg-black text-white"
      />
      <div
        class="text-gray-600 rounded-r-2xl p-4 my-auto rounded-l-none rounded border bg-gray-100"
      >
        {user.currency}
      </div>
    </div>
  </div>

  <div class="w-full">
    <label for="img" class="font-bold mb-1 block">{$t("items.image")}</label>

    <div class="grid grid-cols-2 gap-4">
      <div class="h-64 rounded-2xl overflow-hidden">
        {#if src}
          <img
            {src}
            alt={item.name}
            class="object-cover w-full h-full"
            on:click={select}
            on:keydown={select}
          />
        {:else if item.image}
          <img
            src={`/api/public/${item.image}.webp`}
            alt={item.name}
            class="object-cover w-full h-full"
            on:click={select}
            on:keydown={select}
          />
        {:else}
          <div
            class="bg-gradient-to-r from-primary to-gradient mb-4 cursor-pointer hover:opacity-80 w-full h-full"
            on:click={select}
            on:keydown={select}
            alt="Banner"
          />
        {/if}
      </div>
    </div>

    <input
      type="file"
      class="hidden"
      bind:this={fileInput}
      on:change={(e) => handleFile(e, "item")}
    />
  </div>

  <button
    class="rounded-full py-5 px-6 font-bold hover:opacity-80 border bg-black text-white text-2xl w-full text-center"
  >
    {#if submitting}
      <Spinner />
    {:else}
      {$t("items.submit")}
    {/if}
  </button>
</form>
