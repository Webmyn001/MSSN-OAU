<script>
    import PageHeader from "$lib/components/PageHeader.svelte";
    import {MetaTags} from "svelte-meta-tags";
</script>

<!-- Meta Tags -->
<MetaTags
        title="Alumnae Reconnect"
        titleTemplate="%s | MSSNOAU"
        description="Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University."
        canonical="https://mssnoau-frontend.vercel.app/our-advisors"
        openGraph={{
    url: 'https://mssnoau-frontend.vercel.app/our-advisors',
    title: 'Alumnae Reconnect | MSSNOAU',
    description: 'Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University.',
    images: [
      {
        url: 'https://i.ibb.co/HqK7S8Z/our-advisors.jpg',
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

<section class="py-24 bg-gray-50">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center flex-col lg:flex-row md:mt-20">
            <div class="w-full lg:w-1/2">
                <h2 class="text-5xl text-gray-900 font-semibold leading-[4rem] mb-7 text-center lg:text-left font-secondary">
                    Give back to <br />The Community</h2>
                <p class="text-lg text-gray-500 mb-16 text-center lg:text-left font-tertiary md:pr-12">We would love to hear how you, as a valued alumna, believe you can contribute to the growth and success of our organization. Whether through mentorship, resources, or other forms of support, your involvement can make a meaningful impact. Please share with us how you'd like to help.</p>
                <button class="cursor-pointer py-3 px-8 w-60 bg-primary-700 text-white text-base font-semibold transition-all duration-500 block text-center rounded-xl hover:bg-primary-700/90 mx-auto lg:mx-0">Fill the form</button>
            </div>
            <div class="w-full lg:w-1/2 lg:mt-0 md:mt-40 mt-16 max-lg:max-w-2xl">
                <div class="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-3 gap-8">
                    <img src="/images/bg-1.png" alt="Team tailwind section"
                         class="w-44 h-56 rounded-2xl object-cover md:mt-20 mx-auto min-[450px]:mr-0" />
                    <img src="/images/bg-4.jpg" alt="Team tailwind section"
                         class="w-44 h-56 rounded-2xl object-cover mx-auto min-[450px]:ml-0 md:mx-auto" />
                    <img src="/images/bg-2.jpg" alt="Team tailwind section"
                         class="w-44 h-56 rounded-2xl object-cover md:mt-20 mx-auto min-[450px]:mr-0 md:ml-0" />
                    <img src="/images/bg-5.jpg" alt="Team tailwind section"
                         class="w-44 h-56 rounded-2xl object-cover mx-auto min-[450px]:ml-0 md:mr-0 md:ml-auto" />
                    <img src="/images/bg-3.png" alt="Team tailwind section"
                         class="w-44 h-56 rounded-2xl object-cover md:-mt-20 mx-auto min-[450px]:mr-0 md:mx-auto" />
                    <img src="/images/bg-6.jpg" alt="Team tailwind section"
                         class="w-44 h-56 rounded-2xl object-cover mx-auto min-[450px]:ml-0 md:mr-0" />

                </div>
            </div>
        </div>
    </div>

    <div class="mt-12 max-w-lg mx-auto">
        <!-- Card -->
        <div class="flex flex-col border rounded-xl p-4 sm:p-6 lg:p-8">
            <h2 class="mb-8 text-xl font-semibold text-gray-800">
                Alumnae Form
            </h2>

            <form>
                <div class="grid gap-4 lg:gap-6">
                    <!-- Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                        <div>
                            <label for="fname" class="block mb-2 text-sm text-gray-700 font-medium ">First Name</label>
                            <input type="text" required autocomplete="given-name" name="fname" id="fname" class="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-green-600 focus:ring-green-600 disabled:opacity-50 disabled:pointer-events-none">
                        </div>

                        <div>
                            <label for="lname" class="block mb-2 text-sm text-gray-700 font-medium ">Last Name</label>
                            <input type="text" required autocomplete="family-name" name="lname" id="lname" class="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-green-600 focus:ring-green-600 disabled:opacity-50 disabled:pointer-events-none">
                        </div>
                    </div>
                    <!-- End Grid -->

                    <!-- Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                        <div>
                            <label for="email" class="block mb-2 text-sm text-gray-700 font-medium ">Email [optional]</label>
                            <input type="email" name="email" id="email" autocomplete="email" class="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-green-600 focus:ring-green-600 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600">
                        </div>

                        <div>
                            <label for="phone" class="block mb-2 text-sm text-gray-700 font-medium ">Phone Number</label>
                            <input type="tel" required autocomplete="mobile tel" name="phone" id="phone" class="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-green-600 focus:ring-green-600 disabled:opacity-50 disabled:pointer-events-none">
                        </div>
                    </div>
                    <!-- End Grid -->

                    <div>
                        <label for="message" class="block mb-2 text-sm text-gray-700 font-medium ">Message</label>
                        <textarea id="message" required name="message" rows="5" class="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-green-600 focus:ring-green-600 disabled:opacity-50 disabled:pointer-events-none"></textarea>
                    </div>
                </div>
                <!-- End Grid -->

                <div class="mt-6 grid">
                    <button type="submit" class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-green-700 text-white hover:bg-green-800 focus:outline-none focus:bg-green-800 disabled:opacity-50 disabled:pointer-events-none">Submit Message</button>
                </div>

                <div class="mt-3 text-center">
                    <p class="text-sm text-gray-500">
                        We'll try to get back to you as soon as possible Insha'Allah.
                    </p>
                </div>
            </form>
        </div>
        <!-- End Card -->
    </div>
</section>


