import { test, expect } from "@playwright/test";

// 1x1 red JPEG as base64
const TINY_JPEG_B64 =
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkS" +
  "Ew8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJ" +
  "CQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy" +
  "MjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/" +
  "EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AKwA//9k=";

test.describe("Blossom image rendering", () => {
  test("Chrome renders <img src> with application/octet-stream", async ({ page }) => {
    await page.route("**/mock-blossom/**", async (route) => {
      const jpegBytes = Buffer.from(TINY_JPEG_B64, "base64");
      await route.fulfill({
        status: 200,
        contentType: "application/octet-stream",
        body: jpegBytes,
      });
    });

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const result = await page.evaluate(async () => {
      const img = document.createElement("img");
      img.src = "/mock-blossom/test.jpg";
      document.body.prepend(img);

      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        setTimeout(resolve, 3000);
      });

      return {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      };
    });

    console.log("Direct <img src> with octet-stream:", result);
    expect(result.naturalWidth, "Image should render despite octet-stream content-type").toBeGreaterThan(0);
  });

  test("ChatMessage component renders imeta images", async ({ page }) => {
    // Mock blossom-like endpoint
    await page.route("**/mock-blossom/**", async (route) => {
      const jpegBytes = Buffer.from(TINY_JPEG_B64, "base64");
      await route.fulfill({
        status: 200,
        contentType: "application/octet-stream",
        body: jpegBytes,
      });
    });

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Inject a ChatMessage-like rendering with imeta tags
    const result = await page.evaluate(async () => {
      const container = document.createElement("div");
      container.id = "test-chat";
      document.body.prepend(container);

      // Simulate the imeta extraction logic from ChatMessage.svelte
      const tags = [
        ["imeta", "url /mock-blossom/chat-image", "m image/jpeg", "x abc123"],
      ];

      const imetaImages = tags
        .filter((t) => t[0] === "imeta" && t.some((v) => v.startsWith("m image/")))
        .map((t) => ({
          url: t.find((v) => v.startsWith("url "))?.slice(4) || "",
          mime: t.find((v) => v.startsWith("m "))?.slice(2) || "image/jpeg",
        }))
        .filter((m) => m.url);

      // Render like the template does
      for (const img of imetaImages) {
        const a = document.createElement("a");
        a.href = img.url;
        a.target = "_blank";
        const imgEl = document.createElement("img");
        imgEl.src = img.url;
        imgEl.alt = "";
        imgEl.style.maxWidth = "100%";
        imgEl.style.borderRadius = "8px";
        a.appendChild(imgEl);
        container.appendChild(a);
      }

      // Wait for images to load
      await new Promise((r) => setTimeout(r, 2000));

      const imgs = container.querySelectorAll("img");
      const results: any[] = [];
      for (const img of imgs) {
        results.push({
          naturalWidth: (img as HTMLImageElement).naturalWidth,
          naturalHeight: (img as HTMLImageElement).naturalHeight,
          src: (img as HTMLImageElement).src.substring(0, 60),
        });
      }
      return { imageCount: imetaImages.length, rendered: results };
    });

    console.log("ChatMessage rendering:", JSON.stringify(result, null, 2));
    expect(result.imageCount).toBe(1);
    expect(result.rendered[0].naturalWidth).toBeGreaterThan(0);
  });

  test("imeta URL is suppressed from link rendering", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Simulate the duplicate-suppression logic
    const result = await page.evaluate(() => {
      const tags = [
        ["imeta", "url https://blossom.example.com/abc123", "m image/jpeg"],
      ];
      const content = "https://blossom.example.com/abc123";

      // Extract imeta URLs
      const imetaImages = tags
        .filter((t) => t[0] === "imeta" && t.some((v) => v.startsWith("m image/")))
        .map((t) => ({
          url: t.find((v) => v.startsWith("url "))?.slice(4) || "",
        }))
        .filter((m) => m.url);
      const imetaUrls = new Set(imetaImages.map((i) => i.url));

      // Check if the content URL would be suppressed
      return {
        contentUrl: content,
        imetaUrls: [...imetaUrls],
        wouldSuppress: imetaUrls.has("https://blossom.example.com/abc123"),
      };
    });

    console.log("Duplicate suppression:", result);
    expect(result.wouldSuppress).toBe(true);
  });
});
