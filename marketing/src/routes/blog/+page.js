// * Return empty posts - will be fetched client-side
// * This allows static site generation while still fetching WordPress posts
export const load = async () => {
	return {
		posts: []
	};
}