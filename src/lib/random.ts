const animals = [
  "alligator", "bear", "cat", "dog", "eagle", "falcon", "gorilla", "hawk",
  "iguana", "jaguar", "koala", "lion", "moose", "newt", "otter", "penguin",
  "quail", "rabbit", "shark", "tiger", "urchin", "viper", "walrus", "fox",
  "yak", "zebra", "badger", "crane", "dolphin", "elk",
];

const colors = [
  "red", "blue", "green", "gold", "silver", "coral", "amber", "violet",
  "teal", "crimson", "ivory", "jade", "navy", "olive", "scarlet",
];

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

export const randomName = () => pick(animals) + randInt(10, 99);
export const randomPassword = () => pick(colors) + randInt(100, 999);
