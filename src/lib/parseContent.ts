import { nip19 } from "nostr-tools";

export const NEWLINE = "newline";
export const TEXT = "text";
export const TOPIC = "topic";
export const LINK = "link";
export const INVOICE = "invoice";
export const NOSTR_NOTE = "nostr:note";
export const NOSTR_NEVENT = "nostr:nevent";
export const NOSTR_NPUB = "nostr:npub";
export const NOSTR_NPROFILE = "nostr:nprofile";
export const NOSTR_NADDR = "nostr:naddr";

const first = (list: any) => (list ? list[0] : undefined);

export const fromNostrURI = (s: string) => s.replace(/^[\w+]+:\/?\/?/, "");

export const urlIsMedia = (url: string) =>
  !url.match(/\.(apk|docx|xlsx|csv|dmg)/) && url.split("://").pop()?.includes("/");

export type ParsedPart = {
  type: string;
  value: any;
};

export const isImage = (url: string) => url?.match(/^.*\.(jpg|jpeg|png|webp|gif|avif|svg)/gi);
export const isVideo = (url: string) => url?.match(/^.*\.(mov|mkv|mp4|avi|m4v|webm)/gi);
export const isAudio = (url: string) => url?.match(/^.*\.(ogg|mp3|wav)/gi);

type ContentArgs = {
  content: string;
  tags?: Array<[string, string, string]>;
};

export const parseContent = ({ content, tags = [] }: ContentArgs): ParsedPart[] => {
  const result: ParsedPart[] = [];
  let text = content.trim();
  let buffer = "";

  const parseNewline = () => {
    const newline = first(text.match(/^\n+/));
    if (newline) {
      return [NEWLINE, newline, newline];
    }
  };

  const parseMention = () => {
    const mentionMatch = text.match(/^#\[(\d+)\]/i);
    if (mentionMatch) {
      const i = parseInt(mentionMatch[1]);
      if (tags[i]) {
        const [tag, value, url] = tags[i];
        const relays = url ? [url] : [];

        let type, data, entity;
        try {
          if (tag === "p") {
            type = "nprofile";
            data = { pubkey: value, relays };
            entity = nip19.nprofileEncode(data);
          } else {
            type = "nevent";
            data = { id: value, relays, pubkey: null };
            entity = nip19.neventEncode(data);
          }
        } catch {
          /**/
        }

        return [`nostr:${type}`, mentionMatch[0], { ...data, entity }];
      }
    }
  };

  const parseTopic = () => {
    const topic = first(text.match(/^#\w+/i));
    if (topic && !topic.match(/^#\d+$/)) {
      return [TOPIC, topic, topic.slice(1)];
    }
  };

  const parseBech32 = () => {
    const bech32 = first(
      text.match(/^(web\+)?(nostr:)?\/?\/?n(event|ote|profile|pub|addr)1[\d\w]+/i),
    );

    if (bech32) {
      try {
        const entity = fromNostrURI(bech32);
        const { type, data } = nip19.decode(entity) as {
          type: string;
          data: object;
        };

        let value = data;
        if (type === "note") {
          value = { id: data };
        } else if (type === "npub") {
          value = { pubkey: data };
        }

        return [`nostr:${type}`, bech32, { ...value, entity }];
      } catch (e) {
        console.log(e);
      }
    }
  };

  const parseUrl = () => {
    const raw = first(text.match(/^([a-z+:]{2,30}:\/\/)?[^\s]+\.[a-z]{2,6}[^\s]*[^.!?,:\s]/gi));

    if (raw) {
      const prev = result[result.length - 1];

      if (prev?.type === "text" && prev.value.endsWith("/")) {
        return;
      }

      let url = raw;

      if (url.match(/\.\./)) {
        return;
      }

      if (!url.match("://")) {
        url = "https://" + url;
      }

      return [LINK, raw, { url, isMedia: urlIsMedia(url) }];
    }
  };

  while (text) {
    const part =
      parseNewline() ||
      parseMention() ||
      parseTopic() ||
      parseBech32() ||
      parseUrl();

    if (part) {
      if (buffer) {
        result.push({ type: "text", value: buffer });
        buffer = "";
      }

      const [type, raw, value] = part;
      result.push({ type, value });
      text = text.slice(raw.length);
    } else {
      const match = first(text.match(/^[\w\d]+ ?/i)) || text[0];
      buffer += match;
      text = text.slice(match.length);
    }
  }

  if (buffer) {
    result.push({ type: TEXT, value: buffer });
  }

  return result;
};
