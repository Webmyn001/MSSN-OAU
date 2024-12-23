export const load = async ({ fetch }) => {
    const postsReq = await fetch("/api/v1/blog")

    if (postsReq.ok) {
        /**
         * @type {{ status: boolean, data: { posts: PostRes[] } }}
         */
        const res = await postsReq.json()
        if (res && res.data.posts) {
            return {
                posts: res.data.posts.slice(0, 11)}
        }
    }
}