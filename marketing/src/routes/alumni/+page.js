export const load = async ({ parent }) => {
	const data = await parent();

	return { alumni: data.alumni || { sessions: [] } };
};
