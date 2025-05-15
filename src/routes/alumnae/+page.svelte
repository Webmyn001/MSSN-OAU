<script>
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import {MetaTags} from "svelte-meta-tags";
    import ContactForm from "$lib/components/forms/ContactForm.svelte";
    import { fly, fade, scale } from 'svelte/transition'
    import { onMount } from 'svelte'
    import { Image } from '$lib/components/ui/image'
    import { ArrowRight } from '@lucide/svelte'
	import { PUBLIC_ALUMNAE_FORM } from "$env/static/public";

    let visible = $state(false);
    let hoveredImage = $state(null);

    let { children } = $props();
    
    onMount(() => {
        visible = true
    })
</script>

<!-- Meta Tags -->
<MetaTags
        title="Alumnae Reconnect"
        titleTemplate="%s | MSSNOAU"
        description="Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University."
        canonical="https://mssnoau-frontend.vercel.app/alumnae"
        openGraph={{
    url: 'https://mssnoau-frontend.vercel.app/alumnae',
    title: 'Alumnae Reconnect | MSSNOAU',
    description: 'Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University.',
    images: [
      {
        url: 'https://i.ibb.co/4sznVXp/alumnae.webp',
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
    Reconnect with MSSNOAU
</PageHeader>

<section class="pt-6 pb-12 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>
    
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="flex justify-between items-center flex-col lg:flex-row md:mt-20">
            {#if visible}
                <!-- Content with animation -->
                <div 
                    class="w-full lg:w-1/2"
                    in:fly={{ x: -30, duration: 800, delay: 200 }}
                >
                    <h2 class="text-2xl sm:text-3xl md:text-4xl text-gray-900 font-semibold leading-[4rem] mb-7 text-center lg:text-left font-secondary relative inline-block">
                        Give back to <br />The Community
                        <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary-700 rounded-full"></span>
                    </h2>
                    <p class="text-lg text-gray-500 mb-16 text-center lg:text-left font-tertiary md:pr-12">
                        We would love to hear how you, as a valued alumna, believe you can contribute to the growth and success of our organization. Whether through mentorship, resources, or other forms of support, your involvement can make a meaningful impact. Please share with us how you'd like to help.
                    </p>
                    <a 
                        class="cursor-pointer py-3 px-8 w-60 bg-primary-700 text-white text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 rounded-xl hover:bg-primary-800 hover:-translate-y-1 hover:shadow-lg mx-auto lg:mx-0"
                        href={PUBLIC_ALUMNAE_FORM}
                        target="_blank"
                    >
                        Fill the form
                        <ArrowRight class="size-4" />
                    </a>
                </div>
                
                <!-- Image grid with staggered animation -->
                <div 
                    class="w-full lg:w-1/2 lg:mt-0 md:mt-40 mt-16 max-lg:max-w-2xl"
                    in:fly={{ x: 30, duration: 800, delay: 400 }}
                >
                    <div class="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                        {#each [
                            { src: "/images/bg-1.webp", alt: "OAU Pic", delay: 600, class: "md:mt-20 mx-auto min-[450px]:mr-0" },
                            { src: "/images/bg-4.webp", alt: "OAU Pic", delay: 700, class: "mx-auto min-[450px]:ml-0 md:mx-auto" },
                            { src: "/images/bg-2.webp", alt: "OAU Pic", delay: 800, class: "md:mt-20 mx-auto min-[450px]:mr-0 md:ml-0" },
                            { src: "/images/bg-5.webp", alt: "OAU Pic", delay: 900, class: "mx-auto min-[450px]:ml-0 md:mr-0 md:ml-auto" },
                            { src: "/images/bg-3.webp", alt: "OAU Pic", delay: 1000, class: "md:-mt-20 mx-auto min-[450px]:mr-0 md:mx-auto" },
                            { src: "/images/bg-6.webp", alt: "OAU Pic", delay: 1100, class: "mx-auto min-[450px]:ml-0 md:mr-0" }
                        ] as img, i}
                            <div 
                                role="button"
                                tabindex="0"
                                in:scale={{ duration: 600, delay: img.delay }}
                                class="relative group"
                                onmouseenter={() => hoveredImage = i}
                                onmouseleave={() => hoveredImage = null}
                            >
                                <div class="absolute inset-0 bg-primary-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <img 
                                    src={img.src || "/placeholder.svg"} 
                                    alt={img.alt}
                                    class="w-44 h-56 rounded-2xl object-cover shadow-md border border-white/20 transition-all duration-500 {img.class} {hoveredImage === i ? 'scale-105 shadow-xl' : ''}"
                                />
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    </div>

    {@render children?.()}
</section>

