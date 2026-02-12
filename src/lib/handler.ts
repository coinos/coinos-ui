import { goto } from "$app/navigation";
import { applyAction } from "$app/forms";

export default (toggle) => () => {
  toggle();
  return async ({ result }) => {
    if (result.type === "redirect") {
      goto(result.location);
    } else {
      await applyAction(result);
    }
  };
};
