export const load = async ({ params, parent }) => {
  const p = await parent();
  const { amount, rate } = p;
  const { id } = params;
  return { amount, id, rate };
};
