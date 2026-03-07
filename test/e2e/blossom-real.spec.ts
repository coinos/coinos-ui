import { test, expect } from "@playwright/test";

const BLOSSOM_URL =
  "https://blossom.primal.net/7a2fd4e46f5054fa102c4db68f58c57e630c4f7fdfa06fa08a4b81b21741c541";

test("diagnose blossom image loading", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  const result = await page.evaluate(async (url) => {
    const diag: any = {};

    // Step 1: Fetch
    try {
      const r = await fetch(url);
      diag.fetchOk = r.ok;
      diag.fetchStatus = r.status;
      diag.fetchContentType = r.headers.get("content-type");
      diag.fetchUrl = r.url; // final URL after redirects

      const blob = await r.blob();
      diag.blobSize = blob.size;
      diag.blobType = blob.type;

      // Check first bytes (JPEG magic: FF D8 FF)
      const arr = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
      diag.magic = Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join(" ");
      diag.isJpeg = arr[0] === 0xff && arr[1] === 0xd8 && arr[2] === 0xff;

      // Step 2: Re-type blob
      const retyped = new Blob([blob], { type: "image/jpeg" });
      diag.retypedSize = retyped.size;
      diag.retypedType = retyped.type;

      const blobUrl = URL.createObjectURL(retyped);
      diag.blobUrl = blobUrl;

      // Step 3: Try to load as img
      const img = document.createElement("img");
      img.src = blobUrl;
      document.body.prepend(img);

      const imgResult = await new Promise<string>((resolve) => {
        img.onload = () => resolve("loaded");
        img.onerror = () => resolve("error");
        setTimeout(() => resolve("timeout"), 10000);
      });

      diag.imgResult = imgResult;
      diag.naturalWidth = img.naturalWidth;
      diag.naturalHeight = img.naturalHeight;

      // Step 4: Also try data URL
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(retyped);
      });
      diag.dataUrlPrefix = dataUrl.substring(0, 40);

      const img2 = document.createElement("img");
      img2.src = dataUrl;
      document.body.prepend(img2);

      const img2Result = await new Promise<string>((resolve) => {
        img2.onload = () => resolve("loaded");
        img2.onerror = () => resolve("error");
        setTimeout(() => resolve("timeout"), 10000);
      });
      diag.dataUrlResult = img2Result;
      diag.dataUrlWidth = img2.naturalWidth;
    } catch (e: any) {
      diag.error = e.message;
    }

    return diag;
  }, BLOSSOM_URL);

  console.log("Blossom diagnosis:", JSON.stringify(result, null, 2));
  // Just log, don't assert
});
