// * Use mocked data directly (no server-side fetching)
import { mockBlog } from "$lib/mocks/data.js";

export const load = async () => {
	return {
		posts: mockBlog.posts.slice(0, 11)
	};
}