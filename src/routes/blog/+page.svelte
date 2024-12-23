<script>
    import {toast} from "svelte-sonner";
    import {formatDate} from "$lib/utils/dates.js";
    import {onMount} from "svelte";
    import PageHeader from "$lib/components/PageHeader.svelte";
    import {MetaTags} from "svelte-meta-tags";

    export let data;

    onMount(() => {
        if (data.posts && data.posts.length === 0) {
            toast.error("Blog server is temporarily unavailable.", {
                duration: Number.POSITIVE_INFINITY,
                action: {
                    label: "Go to blog",
                    onClick: () => window.open("https://annuurpress.org.ng")
                }
            })
        }
    })


</script>

<!-- Meta Tags -->
<MetaTags
        title="Blog"
        titleTemplate="%s | MSSNOAU"
        description="Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University."
        canonical="https://mssnoau-frontend.vercel.app/"
        openGraph={{
    url: 'https://mssnoau-frontend.vercel.app/',
    title: 'Blog | MSSNOAU',
    description: 'Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University.',
    images: [
      {
        url: 'https://i.ibb.co/zbWfh5B/home.webp',
        width: 1200,
        height: 640,
        alt: 'Website screenshot'
      }
    ],
    siteName: 'MSSNOAU'
  }}
/>
<!-- End Meta Tags -->


<PageHeader>
    Our Blog
    <p class="text-neutral-100 text-center font-tertiary sm:text-sm text-xs mt-4">
        Reflective, immersive write-ups, curated by the <a href="https://annuurpress.org.ng/"
                                                           class="semibold underline">An-Nuur Press</a>
    </p>
</PageHeader>


<section class="py-16">
    <div class="max-w-7xl mx-auto px-5 sm:px-10 md:px-12 lg:px-5 space-y-14">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 rounded-t-lg">
            {#if data.posts && Array.isArray(data.posts)}
                {#each data.posts as post}
                    <!-- Post -->
                    <a href={post.link}
                       target="_blank"
                       class="flex p-px flex-col bg-gray-100 group border border-gray-200 rounded-xl">
                        <div class="flex rounded-t-[7px] bg-gray-300">
                            <img src={post.featured_image}
                                 class="rounded-t-[7px] aspect-[4/2.8] w-full object-cover" alt={post.title}/>
                        </div>
                        <div class="flex flex-col p-5 relative justify-between h-full">
                            <h1
                                    class="text-xl/tight text-ellipsis whitespace-nowrap overflow-hidden font-semibold text-gray-800 group-hover:text-green-700">
                                {@html post.title}
                            </h1>
                            <p class="text-gray-700 text-ellipsis py-2 line-clamp-2">{@html post.excerpt}</p>
                            <div class="flex items-center space-x-2 text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                     stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"/>
                                </svg>
                                <span>{formatDate(post.date).date}</span>
                            </div>
                        </div>
                    </a>
                    <!-- End Post -->
                {/each}
                <!-- Newsletter Form -->
                <div id="newsletter"
                     class="sm:col-span-2 lg:col-span-1 p-6 sm:p-10 md:p-14 lg:p-8 rounded-xl bg-gray-100 flex flex-col space-y-6 relative">
                    <div
                            class="absolute w-14 h-14 rounded-full bg-gradient-to-bl from-green-700 to-violet-500 blur-2xl z-10 -top-7 -left-7 opacity-40">
                    </div>
                    <div
                            class="absolute w-14 h-14 rounded-full bg-gradient-to-bl from-green-700 to-violet-500 blur-2xl z-10 -bottom-7 -right-7 opacity-40">
                    </div>
                    <div class="lg:h-full flex flex-col items-center text-center justify-center space-y-5 mx-auto max-w-2xl">
                        <h1 class="font-bold text-gray-900 text-3xl">
                            Join our Newsletter
                        </h1>
                        <p class="text-gray-700 text-center">
                            Only Events, Blog Posts and Press Releases.
                        </p>
                        <form action=""
                              class="w-full flex flex-col sm:items-center sm:flex-row lg:flex-col gap-y-3 gap-x-4">
                            <input type="email"
                                   class="py-3 px-5 rounded-lg text-gray-800 bg-gray-200 outline-none w-full placeholder:text-gray-600"
                                   placeholder="ali@example.com">
                            <div class="flex justify-center w-full sm:w-max lg:w-full">
                                <button
                                        onclick={() => toast.warning("Newsletter is currently unavailable.")}
                                        class="py-3 rounded-lg px-6 bg-green-700 text-white font-medium text-base w-full flex justify-center">
                                    Subscribe
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <!-- End Newsletter Form -->

            {/if}
        </div>

        <!--   See More    -->
        <div class="flex justify-center">
            <a href="https://annuurpress.org.ng/category/articles/"
               class="px-6 py-3 border rounded-lg border-gray-100 text-green-700 flex items-center gap-x-3">
                See More
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                     stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                </svg>
            </a>
        </div>
        <!--   End See More     -->

    </div>
</section>