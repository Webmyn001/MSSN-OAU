<script>
    import PageHeader from "$lib/components/PageHeader.svelte";
    import {MetaTags} from "svelte-meta-tags";
    import ContactForm from "$lib/components/ContactForm.svelte";
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

<section class="pb-12">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center flex-col lg:flex-row md:mt-20">
            <div class="w-full lg:w-1/2">
                <h2 class="text-5xl text-gray-900 font-semibold leading-[4rem] mb-7 text-center lg:text-left font-secondary">
                    Give back to <br />The Community</h2>
                <p class="text-lg text-gray-500 mb-16 text-center lg:text-left font-tertiary md:pr-12">We would love to hear how you, as a valued alumna, believe you can contribute to the growth and success of our organization. Whether through mentorship, resources, or other forms of support, your involvement can make a meaningful impact. Please share with us how you'd like to help.</p>
                <a class="cursor-pointer py-3 px-8 w-60 bg-primary-700 text-white text-base font-semibold transition-all duration-500 block text-center rounded-xl hover:bg-primary-700/90 mx-auto lg:mx-0" href="#form">Fill the form</a>
            </div>
            <div class="w-full lg:w-1/2 lg:mt-0 md:mt-40 mt-16 max-lg:max-w-2xl">
                <div class="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-3 gap-8">
                    <img src="/images/bg-1.webp" alt="OAU Pic"
                         class="w-44 h-56 rounded-2xl object-cover md:mt-20 mx-auto min-[450px]:mr-0" />
                    <img src="/images/bg-4.webp" alt="OAU Pic"
                         class="w-44 h-56 rounded-2xl object-cover mx-auto min-[450px]:ml-0 md:mx-auto" />
                    <img src="/images/bg-2.webp" alt="OAU Pic"
                         class="w-44 h-56 rounded-2xl object-cover md:mt-20 mx-auto min-[450px]:mr-0 md:ml-0" />
                    <img src="/images/bg-5.webp" alt="OAU Pic"
                         class="w-44 h-56 rounded-2xl object-cover mx-auto min-[450px]:ml-0 md:mr-0 md:ml-auto" />
                    <img src="/images/bg-3.webp" alt="OAU Pic"
                         class="w-44 h-56 rounded-2xl object-cover md:-mt-20 mx-auto min-[450px]:mr-0 md:mx-auto" />
                    <img src="/images/bg-6.webp" alt="OAU Pic"
                         class="w-44 h-56 rounded-2xl object-cover mx-auto min-[450px]:ml-0 md:mr-0" />

                </div>
            </div>
        </div>
    </div>

    <ContactForm />
</section>


