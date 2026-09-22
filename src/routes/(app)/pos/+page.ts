import { redirect } from "@sveltejs/kit";

// The web flasher moved to /flash: /pos is the coinos v3 till.
export const load = () => {
  redirect(301, "/flash");
};
