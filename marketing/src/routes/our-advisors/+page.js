export const load = async ({ parent }) => {
	const data = await parent();

	return { advisors: data.advisors || [] };
};
