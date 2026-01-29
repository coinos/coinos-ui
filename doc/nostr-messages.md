# coinos Nostr Messages - Technical Information

Last Updated: 2026-01-28

CoinOS uses [Nostr](https://github.com/nostr-protocol/nostr)'s [NIP-17](https://github.com/nostr-protocol/nips/blob/master/17.md) for its direct message system.  A CoinOS account is not necessary to send or receive messages using this system, and CoinOS users can interact with non-CoinOS users.

## Relay Usage

CoinOS will search the relays in the environment variable `PUBLIC_DM_RELAYS` for kind-10050 events.  `PUBLIC_DM_RELAYS` is a comma-separated list of URLs.  Any message sent to a user will go to the relays in their kind-10050 event, as per NIP-17.

## Features

- Send & receive messages
- Can use either browser extensions ([NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md)) or user accounts' saved nostr keys.
- Can chat with any nostr user, not just coinos accounts
- Can configure your DM relays within the settings page
- Automatically disappearing messages ([NIP-40](https://github.com/nostr-protocol/nips/blob/master/40.md))
- Can add users to nostr's mute list, hiding them from the menu
- UI shows users' nostr information if they're not a coinos account

## Limitations

- There is no way to delete messages, aside from setting them to be deleted automatically, due to [an inherent limitation of the protocol](https://github.com/nostr-protocol/nips/issues/1735).

## Dependencies

coinos's nostr messages depends on the `npm` package [`nostr-tools`](https://www.npmjs.com/package/nostr-tools).

## Relevant NIPs

- [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md) - the main protocol
- [NIP-05](https://github.com/nostr-protocol/nips/blob/master/05.md) - user identity verification via domain names
- [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md) - Nostr browser extensions
- **[NIP-17](https://github.com/nostr-protocol/nips/blob/master/17.md)** - Private Direct Messages
- [NIP-40](https://github.com/nostr-protocol/nips/blob/master/40.md) - Message expiration
- [NIP-44](https://github.com/nostr-protocol/nips/blob/master/44.md) - Message encryption
- [NIP-51](https://github.com/nostr-protocol/nips/blob/master/51.md) - User lists (used for muting)
