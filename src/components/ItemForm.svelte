<script lang="ts">
  import { preventDefault } from "svelte/legacy";

  import { t } from "$lib/translations";
  import { upload } from "$lib/upload";
  import { fail } from "$lib/utils";
  import { applyAction, deserialize } from "$app/forms";
  import Spinner from "$comp/Spinner.svelte";
  let { item = $bindable(), user } = $props();

  let fileInput: HTMLInputElement | undefined = $state(),
    formElement: HTMLFormElement | undefined = $state(),
    file: File,
    submitting = $state(),
    progress: any;
  let select = () => fileInput!.click();
  let src: string | undefined = $state();

  let tooLarge: Record<string, boolean> = {};
  let handleFile = async ({ target }: { target: EventTarget | null }, type: string) => {
    tooLarge[type] = false;
    file = (target as HTMLInputElement).files![0];
    if (!file) return;

    if (file.size > 10000000) return (tooLarge[type] = true);

    var reader = new FileReader();
    reader.onload = async (e) => {
      src = (e.target as FileReader).result as string;
    };

    reader.readAsDataURL(file);
  };

  async function handleSubmit() {
    try {
      submitting = true;
      let data = new FormData(formElement!);

      if (src) {
        try {
          let { hash } = JSON.parse((await upload(file, "item", progress)) as string);

          data.set("image", hash);

          await fetch(`/api/public/${hash}.webp`, {
            cache: "reload",
            mode: "no-cors",
          });
        } catch (e) {
          console.log("problem upsubmitting avatar", e);
        }
      }

      const response = await fetch(formElement!.action, {
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
  onsubmit={preventDefault(handleSubmit)}
  bind:this={formElement}
>
  <input type="hidden" name="id" bind:value={item.id} />
  <input type="hidden" name="image" bind:value={item.image} />

  <div>
    <label for="name" class="font-bold mb-1 block">{$t("items.name")}</label>
    <input name="name" bind:value={item.name} />
  </div>

  <div>
    <label for="price" class="font-bold mb-1 block">{$t("items.price")}</label>
    <div class="flex">
      <input name="price" bind:value={item.price} class="border-r-none rounded-r-none" />
      <div
        class="text-gray-600 rounded-r-2xl p-4 my-auto rounded-l-none rounded border bg-gray-100"
      >
        {user.currency}
      </div>
    </div>
  </div>

  <div class="w-full">
    <label for="img" class="font-bold mb-1 block">{$t("items.image")}</label>

    <div class="grid sm:grid-cols-2 gap-4">
      <div class="h-64 rounded-2xl overflow-hidden">
        {#if src}
          <button
            type="button"
            class="block w-full h-full"
            onclick={select}
            aria-label="Select image"
          >
            <img {src} alt={item.name} class="object-cover w-full h-full" />
          </button>
        {:else if item.image}
          <button
            type="button"
            class="block w-full h-full"
            onclick={select}
            aria-label="Select image"
          >
            <img
              src={`/api/public/${item.image}.webp`}
              alt={item.name}
              class="object-cover w-full h-full"
            />
          </button>
        {:else}
          <button
            type="button"
            class="bg-gradient-to-r from-primary to-gradient mb-4 cursor-pointer hover:opacity-80 w-full h-full"
            onclick={select}
            aria-label="Select image"
          ></button>
        {/if}
      </div>
    </div>

    <input
      type="file"
      class="hidden"
      bind:this={fileInput}
      onchange={(e) => handleFile(e, "item")}
    />
  </div>

  <button
    class="rounded-full py-5 px-6 font-bold hover:opacity-80 bg-black text-white text-2xl w-full text-center"
  >
    {#if submitting}
      <Spinner />
    {:else}
      {$t("items.submit")}
    {/if}
  </button>
</form>
