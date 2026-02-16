import { expect, test } from "@playwright/test";
import {
  bobUsername,
  bobPassword,
  testSecret,
  apiBaseUrl,
  login,
  createArkInvoiceViaUI,
  sendArkFromTestEndpoint,
} from "./helpers";

test("custodial account receives ark payment via vault forward", async ({
  page,
}) => {
  test.setTimeout(120_000);
  test.skip(!testSecret, "E2E_TEST_SECRET is required");

  // 1. Log in as Bob
  await login(page, bobUsername, bobPassword);

  // 2. Create ark invoice via the vault account (needs wallet unlock)
  const { invoiceId, address } = await createArkInvoiceViaUI(page, bobPassword);
  console.log(
    `[e2e] Created ark invoice ${invoiceId} on vault account, address: ${address}`,
  );

  // 3. Stay on invoice page (subscribe to websocket notifications)
  await page.goto(`/invoice/${invoiceId}`);
  await page.waitForURL(new RegExp(`/invoice/${invoiceId}`));

  // 4. Send ark funds from the server test wallet to the vault address
  await sendArkFromTestEndpoint(page, address, 1000, invoiceId);
  console.log(`[e2e] Sent 1000 sats to vault address ${address}`);

  // 5. Wait for the custodial forward to complete
  // Flow: vault receives → arkSync detects → client forwards to server ark wallet
  //       → POST /ark/receive → credits custodial account
  let paid = false;
  let status: any;

  for (let i = 0; i < 60; i++) {
    const statusResponse = await page.request.get(
      `${apiBaseUrl}/invoice/${invoiceId}`,
    );
    if (statusResponse.ok()) {
      status = await statusResponse.json();
      if ((status?.received || 0) >= 1000) {
        paid = true;
        break;
      }
    }
    await page.waitForTimeout(2000);
  }

  expect(
    paid,
    `Custodial ark forward did not complete: ${JSON.stringify(status)}`,
  ).toBeTruthy();

  console.log(
    `[e2e] Custodial ark receive complete: invoice ${invoiceId} received=${status?.received}`,
  );
});
