export function decode(uri, allowedSchemes = ["bitcoin", "liquidnetwork"]) {
  // Determine the scheme from the URI
  const split = uri.indexOf(":");
  if (split === -1) {
    throw new Error("Invalid URI: Missing scheme");
  }

  const urnScheme = uri.slice(0, split).toLowerCase();
  if (!allowedSchemes.includes(urnScheme)) {
    throw new Error(`Invalid scheme: ${urnScheme}`);
  }

  // Extract address and query string
  const queryStart = uri.indexOf("?");
  const address = uri.slice(
    split + 1,
    queryStart === -1 ? undefined : queryStart,
  );
  const query = queryStart === -1 ? "" : uri.slice(queryStart + 1);
  const options = Object.fromEntries(new URLSearchParams(query));

  if (options.amount) {
    const n = Number(options.amount);
    if (!Number.isFinite(n)) throw new Error("Invalid amount");
    if (n < 0) throw new Error("Invalid amount");
  }

  return { scheme: urnScheme, address, options };
}

export function encode(
  address,
  options = { amount: "" },
  urnScheme = "bitcoin",
) {
  if (!address || typeof address !== "string") {
    throw new TypeError("Invalid address");
  }

  if (!["bitcoin", "liquidnetwork"].includes(urnScheme)) {
    throw new Error(`Unsupported scheme: ${urnScheme}`);
  }

  const n = Number(options?.amount);
  if (!Number.isFinite(n)) throw new Error("Invalid amount");
  if (n < 0) throw new Error("Invalid amount");

  const query = new URLSearchParams(options).toString();
  return `${urnScheme}:${address}${query ? `?${query}` : ""}`;
}
