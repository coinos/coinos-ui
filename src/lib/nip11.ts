import { fetchRelayInformation } from "nostr-tools/nip11";

// Accepts a list of relays, and returns a list of the relays that support all the provided NIPs.
export const relaysSupporting = async (relays: string[], nips: number[]) => {
  let supportingRelays = [];

  for (const relay of relays) {
    const relayInfo = await fetchRelayInformation(relay);
    if (nips.every((relay) => relayInfo.supported_nips.includes(relay))) {
      supportingRelays.push(relay);
    }
  }

  return supportingRelays;
};
