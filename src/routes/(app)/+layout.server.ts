import { auth, get, isInvalidTokenError, sleep } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, depends }) {
  depends("app:user");

  const token = cookies.get("token");

  let user;
  let hasArk = false;
  if (token) {
    const authHeaders = auth(cookies);

    // Fetch user and accounts in parallel
    const [userResult, accounts] = await Promise.all([
      get("/me", authHeaders).catch((e) => ({ _error: e })),
      get("/accounts", authHeaders).catch(() => []),
    ]);

    if (userResult?._error) {
      const e = userResult._error;
      const { message } = e as Error;
      if (message.startsWith("Rate")) {
        await sleep(3000);
        try {
          user = await get("/me", authHeaders);
        } catch (retryError) {
          if (isInvalidTokenError(retryError)) {
            redirect(307, "/logout");
          }
          throw retryError;
        }
      } else if (isInvalidTokenError(e)) {
        redirect(307, "/logout");
      } else {
        throw e;
      }
    } else {
      user = userResult;
    }

    hasArk = accounts.some((a: any) => a.type === "ark");
  }

  if (user?.needsMigration) {
    redirect(307, "/migrate");
  }

  const theme = cookies.get("theme") || "light";

  return { user, token, theme, hasArk };
}
