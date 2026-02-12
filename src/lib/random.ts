import {
  NumberDictionary,
  animals,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";

export const randomName = () =>
  uniqueNamesGenerator({
    dictionaries: [animals, NumberDictionary.generate({ min: 10, max: 99 })],
    length: 2,
    separator: "",
  });

export const randomPassword = () =>
  uniqueNamesGenerator({
    dictionaries: [colors, NumberDictionary.generate({ min: 100, max: 999 })],
    length: 2,
    separator: "",
  });
