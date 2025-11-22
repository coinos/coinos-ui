import { persistLocal } from "$lib/store";

const prefix = "ark";
export const mnemonic = persistLocal(`${prefix}mnemonic`, "");
export const password = persistLocal(`${prefix}password`, "");
