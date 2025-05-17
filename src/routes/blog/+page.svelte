<script>
    import { fly, fade, scale } from 'svelte/transition'
    import { onMount } from 'svelte'
    import { Calendar, ChevronRight, Mail, Send, ExternalLink } from '@lucide/svelte'
    import { toast } from 'svelte-sonner'
    import { formatDate } from "$lib/utils/dates.js"
	import SEO from '$lib/components/SEO.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
    
    let { data } = $props()
    
    let visible = $state(false)
    let hoveredPost = $state(null)
    let email = $state("")

    onMount(() => {
        visible = true
        
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
    
    const handleSubscribe = (e) => {
        e.preventDefault()
        if (!email) {
            toast.error("Please enter your email address")
            return
        }
        
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            toast.error("Please enter a valid email address")
            return
        }
        
        toast.warning("Newsletter is currently unavailable.")
        email = ""
    }

    const jsonLd = [
        {
            "@type": "WebPage",
            "name": "Our Blog | MSSNOAU",
            "description": "Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University.",
            "publisher": {
                "@type": "Organization",
                "name": "MSSNOAU.org"
            }
        },
        ...data?.posts.map(post => {
        return {
            '@type': 'Article',
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': post.link
            },
            headline: post.title,
            image: [
                post.featured_image
            ],
            datePublished: post.date,
            dateModified: post.date,
            author: {
                '@type': 'Person',
                name: post.authors[0].name
            },
            publisher: {
                '@type': 'Organization',
                name: 'MSSNOAU',
                logo: {
                    '@type': 'ImageObject',
                    url: 'https://mssnoau.sirv.com/mssn-logo.png'
                }
            }
        }
    })]


</script>

<SEO
        title="Blog"
        description="Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University."
    path="/blog" 
    type="WebPage"
    images={[
      {
        url: 'https://i.ibb.co/zbWfh5B/home.webp',
        width: 1200,
        height: 640,
            alt: 'MSSNOAU Blog'
        }
    ]}
    schema={jsonLd} 
    keywords={["mssnoau blog", "an-nuur press", "islamic articles", "muslim students oau blog", "oau mssn articles"]}
/>

<PageHeader>
    Our Blog
    <p class="text-neutral-100 text-center font-tertiary sm:text-sm text-xs mt-4">
        Reflective, immersive write-ups, curated by the <a href="https://annuurpress.org.ng/"
                                                           class="semibold underline">An-Nuur Press</a>
    </p>
</PageHeader>


<section class="py-16 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>
    
    <div class="max-w-7xl mx-auto px-5 sm:px-10 md:px-12 lg:px-5 space-y-14 relative z-10">
        {#if visible}
            {#if data.posts && Array.isArray(data.posts) && data.posts.length > 0}
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 rounded-t-lg">
                    {#each data.posts as post, i}
                        <!-- Enhanced Post Card -->
                        <a 
                            href={post.link}
                            target="_blank"
                            class="flex flex-col bg-white/80 backdrop-blur-sm group border border-primary-100 hover:border-primary-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full"
                            in:fly={{ y: 30, duration: 800, delay: 200 + (i * 150) }}
                            onmouseenter={() => hoveredPost = post.title}
                            onmouseleave={() => hoveredPost = null}
                        >
                            <div class="relative overflow-hidden bg-gray-200">
                                <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
                                <img 
                                    src={post.featured_image || "/placeholder.svg"}
                                    class="aspect-[4/2.8] w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    alt={post.title}
                                />
                                
                                <!-- Date badge -->
                                <div class="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                                    <Calendar class="size-3.5" />
                                    <span>{formatDate(post.date).date}</span>
                                </div>
                            </div>
                            
                            <div class="flex flex-col p-5 relative justify-between h-full">
                                <h1 class="text-xl font-semibold text-gray-800 group-hover:text-primary-700 transition-colors line-clamp-2">
                                    {@html post.title.replace("&amp;", "&").replace("&quot;", '"').replace("&apos;", "'").replace("&lt;", "<").replace("&gt;", ">").replace("&nbsp;", " ")}
                                </h1>
                                <p class="text-gray-700 py-3 line-clamp-2 flex-grow">{@html post.excerpt.replace("&amp;", "&").replace("&quot;", '"').replace("&apos;", "'").replace("&lt;", "<").replace("&gt;", ">").replace("&nbsp;", " ").replace("&copy;", "©").replace("&reg;", "®").replaceAll('[…]', '...')}</p>
                                
                                <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div class="flex items-center">
                                        {#if post.authors && post.authors[0]}
                                            <img 
                                                src={post.authors[0].avatar_urls ? post.authors[0].avatar_urls["48"] : "/placeholder.svg?height=48&width=48"} 
                                                alt={post.authors[0].name}
                                                class="size-8 rounded-full border-2 border-white shadow-sm"
                                            />
                                        {/if}
                                    </div>
                                    
                                    <span class="inline-flex items-center justify-center size-8 rounded-full bg-primary-50 text-primary-700 group-hover:bg-primary-100 transition-colors">
                                        <ChevronRight class="size-4" />
                                    </span>
                                </div>
                            </div>
                        </a>
                        <!-- End Post Card -->
                    {/each}
                    
                    <!-- Enhanced Newsletter Form -->
                    <div 
                        id="newsletter"
                        class="sm:col-span-2 lg:col-span-1 p-6 sm:p-8 rounded-xl bg-white/80 backdrop-blur-sm border border-primary-100 shadow-md flex flex-col space-y-6 relative overflow-hidden"
                        in:fly={{ y: 30, duration: 800, delay: 800 }}
                    >
                        <!-- Decorative elements -->
                        <div class="absolute w-32 h-32 rounded-full bg-gradient-to-bl from-primary-500/30 to-primary-700/30 blur-3xl -top-16 -left-16 opacity-60"></div>
                        <div class="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-primary-500/30 to-primary-700/30 blur-3xl -bottom-16 -right-16 opacity-60"></div>
                        
                        <div class="lg:h-full flex flex-col items-center text-center justify-center space-y-5 mx-auto max-w-2xl relative z-10">
                            <div class="inline-flex items-center justify-center size-16 rounded-full bg-primary-100 text-primary-700 mb-2">
                                <Mail class="size-8" />
                            </div>
                            
                            <h1 class="font-bold text-gray-900 text-2xl font-secondary">
                                Join our Newsletter
                            </h1>
                            <p class="text-gray-700 text-center font-tertiary">
                                Only Events, Blog Posts and Press Releases.
                            </p>
                            
                            <form 
                                class="w-full flex flex-col sm:items-center sm:flex-row lg:flex-col gap-y-3 gap-x-4 mt-4"
                                onsubmit={handleSubscribe}
                            >
                                <input 
                                    type="email"
                                    bind:value={email}
                                    class="py-3 px-5 rounded-lg text-gray-800 bg-white border border-gray-200 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 w-full placeholder:text-gray-500 transition-all duration-300"
                                    placeholder="ali@example.com"
                                />
                                <div class="flex justify-center w-full sm:w-max lg:w-full">
                                    <button
                                        type="submit"
                                        class="py-3 rounded-lg px-6 bg-primary-700 text-white font-medium text-base w-full flex justify-center items-center gap-2 hover:bg-primary-800 transition-all duration-300 hover:shadow-md"
                                    >
                                        Subscribe
                                        <Send class="size-4" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <!-- End Newsletter Form -->
                </div>

                <!-- Enhanced See More Button -->
                <div 
                    class="flex justify-center"
                    in:fly={{ y: 30, duration: 800, delay: 1000 }}
                >
                    <a 
                        href="https://annuurpress.org.ng/category/articles/"
                        class="px-6 py-3 border rounded-xl border-primary-100 bg-white/80 backdrop-blur-sm text-primary-700 flex items-center gap-x-3 hover:bg-primary-50 hover:border-primary-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    >
                        See More
                        <ChevronRight class="size-4" />
                    </a>
                </div>
                <!-- End See More Button -->
            {:else}
                <!-- Empty state when no blog posts are available -->
                <div 
                    class="bg-white/80 backdrop-blur-sm rounded-xl border border-primary-100 p-8 shadow-md max-w-lg mx-auto text-center"
                    in:fly={{ y: 30, duration: 800, delay: 200 }}
                >
                    <div class="mb-6 bg-primary-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-10 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <line x1="10" y1="9" x2="8" y2="9"></line>
                        </svg>
                    </div>
                    <h3 class="text-xl font-medium text-gray-800 mb-2">No Blog Posts Available</h3>
                    <p class="text-gray-500 mb-6">We're currently refreshing our content. Please check back soon for new articles and updates.</p>
                    
                    <a 
                        href="https://annuurpress.org.ng"
                        target="_blank"
                        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-700 text-white hover:bg-primary-800 transition-colors"
                    >
                        <span>Visit An-Nuur Press</span>
                        <ExternalLink class="size-4" />
                    </a>
                    
                    <!-- Newsletter form in empty state -->
                    <div class="mt-10 pt-6 border-t border-primary-100">
                        <h4 class="font-medium text-gray-700 mb-3">Subscribe to our newsletter</h4>
                        <form 
                            class="flex flex-col sm:flex-row gap-2"
                            onsubmit={handleSubscribe(e)}
                        >
                            <input 
                                type="email"
                                bind:value={email}
                                class="py-2 px-4 rounded-lg text-gray-800 bg-white border border-gray-200 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 flex-grow"
                                placeholder="ali@example.com"
                            />
                            <button
                                type="submit"
                                class="py-2 rounded-lg px-4 bg-primary-700 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary-800 transition-all"
                            >
                                Subscribe
                                <Send class="size-3.5" />
                            </button>
                        </form>
                    </div>
                </div>
            {/if}
        {/if}
    </div>
</section>