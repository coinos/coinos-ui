export let load = async ({ cookies, params, parent }) => {
  let { rates, user } = await parent();
  let token = params.token || cookies.get("ecash");
  return { rates, token, user };
};
