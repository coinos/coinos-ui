// Returns true if the message has an expiration in the past, false otherwise.
export const expired = (event: { tags: string[][] }): boolean => {
  const expiryTime = expiration(event);
  return expiryTime !== null && Date.now() / 1000 >= expiryTime;
};

// Returns the provided event's expiration time, as a Unix ms integer.
// If it has none, returns null.
export const expiration = (event: { tags: string[][] }): number | null => {
  for (const tag of event.tags) {
    if (tag[0] == "expiration") {
      return parseInt(tag[1]);
    }
  }
  return null;
};
