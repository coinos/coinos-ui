export async function load({ params, url }) {
  const { text } = params;
  const query = new URLSearchParams(url.search);
  const nfc = !!query.get("nfc");
  return { nfc, text };
}
