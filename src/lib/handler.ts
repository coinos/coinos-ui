import { goto } from "$app/navigation";
import { applyAction } from "$app/forms";

export default (submitting) =>
  () => {
    submitting = true;
    return async ({ result }) => {
      if (result.type === "redirect") {
        goto(result.location);
      } else {
        await applyAction(result);
      }
    };
  };
