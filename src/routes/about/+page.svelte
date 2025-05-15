<script>
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import SEO from "$lib/components/SEO.svelte";
    
    // Define the committees variable and showAll state
    let committees = $state([]); // This should be populated with your committee data
    let showAll = $state(false);
    
    // Toggle function for showing all committees
    function toggleShowAll() {
        showAll = !showAll;
    }
</script>

<SEO
    title="About Us"
    path="/about"
    description="Learn about the Muslim Students Society of Nigeria at OAU - our mission, vision, committees, and how we support Muslim students in their academic, spiritual, and personal growth."
    images={[
        {
            url: 'https://i.ibb.co/H7t1bv3/about.webp',
            width: 1200,
            height: 640,
            alt: 'About MSSNOAU'
        }
    ]}
    keywords="MSSN OAU, about MSSNOAU, Muslim student community, Islamic student organization, MSSN committees, Jihad Week Committee, An-Nur Press, Muslim students OAU, Islamic mission and vision"
    schema={{
        "@type": "AboutPage",
        "name": "About MSSNOAU",
        "description": "Learn about the Muslim Students Society of Nigeria at OAU - our mission, vision, committees, and how we support Muslim students in their academic, spiritual, and personal growth.",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://mssnoau.org/about"
        },
        "publisher": {
            "@type": "Organization",
            "name": "MSSNOAU",
            "logo": {
                "@type": "ImageObject",
                "url": "https://mssnoau.sirv.com/mssn-logo.png"
            }
        }
    }}
/>

<PageHeader>
    About MSSNOAU
</PageHeader>

<!-- Who We Are -->
<div class="mt-8 mx-[10dvw] flex items-center flex-col">
    <h3 class="font-semibold text-2xl sm:text-3xl font-secondary mb-4 text-primary">WHO WE ARE</h3>
    <p class="font-tertiary w-full text-center">The Muslim Students Society of Nigeria (MSSN), Obafemi Awolowo University (MSSNOAU) is a branch among MSSN higher institution branches and is an inclusive platform for all Muslim students in the university to find spiritual expression, islamic knowledge, and fellowship irrespective of their backgrounds and orientation.</p>
    <br /><br />
    <p class="font-tertiary w-full text-center">At MSSNOAU, we foster a vibrant and inclusive community where every member is encouraged to grow and excel. Our diverse programs and activities are designed to cater to the holistic development of our members, ensuring they achieve academic excellence while maintaining strong spiritual and moral values.</p>
</div>
<!-- End Who We are -->

<!-- Mission and Vision -->
<div class="w-full mx-auto flex items-center flex-col mt-8 px-[10dvw]">
    <img src="/mssn-logo.png" alt="MSSNOAU Logo" class="w-[40dvw] max-w-[300px] p-6 border border-gray-200 rounded-xl shadow-md" />
    <div class="grid grid-rows-1 sm:grid-cols-2 gap-8 text-center mt-8">
        <div class="flex flex-col gap-2">
            <h4 class="font-secondary text-primary-700 text-2xl font-semibold mb-2">Our Mission</h4>
            <p class="font-tertiary text-center leading-relaxed">
                To work relentlessly towards the establishment of a society that fosters all-around human development. To achieve this, MSSN will continuously strive towards strengthening Ummah educationally, emotionally, spiritually and politically through a wide spectrum of activities in the university and the larger society in partnership with like-minded organizations. To succeed, MSSN must ensure that its members are God-fearing, knowledgeable, united and with superior moral values.
            </p>
        </div>

        <div class="flex flex-col gap-2">
            <h4 class="font-secondary text-primary-700 text-2xl font-semibold mb-2">Our Vision</h4>
            <p class="font-tertiary text-center leading-relaxed">
                To establish an Islamic Ummah governed by the principles and rules of the Shariah. To become a leading student organization that inspires Muslim students to become dynamic leaders, passionate about their faith, knowledge, and community, and to create a supportive environment that nurtures their overall well-being and success.
            </p>
        </div>
    </div>
</div>
<!-- End Mission and Vision -->


<!-- Our Committees -->
<div class="mt-16 mb-12 px-4 md:px-8 max-w-7xl mx-auto">
    <div class="text-center mb-12">
        <h2 class="font-semibold text-3xl sm:text-4xl font-secondary mb-4 text-primary-700">Our Committees</h2>
        <p class="font-tertiary max-w-3xl mx-auto text-gray-600">The Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University Branch, has established various committees to cater to the diverse needs of Muslim students on campus. Students can join these committees to develop valuable skills and contribute meaningfully to the community.</p>
    </div>
    <!--  End Committee  -->

    <!--  Committee  -->
    <div class="grid sm:grid-cols-3 w-full mt-8 gap-8 px-4 py-6 rounded-xl sm:border-r-4 border-t-4 sm:border-t-0 border-green-300 sm:bg-gradient-to-r bg-gradient-to-t from-white to-primary-50">
        <div class="sm:col-span-1 flex items-center justify-center">
            <img
                    src="/images/committees/an-nuur.webp"
                    class="w-3/4 sm:w-full"
                    alt="JWC Committee"
            />
        </div>
        <div class="sm:col-span-2">
            <h2 class="text-3xl mb-4 font-semibold font-primary">An-Nur Press Agency Editorial Board</h2>
            <p class="mb-4"><span class="font-semibold">An-Nur Press Agency Editorial Board</span> is a committee under the Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University Branch, dedicated to organizing a spiritual upliftment and developmental program for Muslim students.</p>

            <p>This press is designed to keep you informed and inspired with the latest updates, insightful articles, and news about our community's spiritual, intellectual, and moral endeavors.</p>

            <p class="font-semibold mt-4">To Join <a class="text-green-800 underline" href="/our-excos#">Other Members</a> of An-Nur Press Agency Editorial Board, <a class="text-green-800 underline" href="">Click here</a>.</p>
        </div>
    </div>
    <!--  End Committee  -->

    <!--  Committee  -->
    <div class="grid sm:grid-cols-3 w-full mt-8 gap-8 px-4 py-6 rounded-xl sm:border-l-4 border-t-4 sm:border-t-0 border-green-300 sm:bg-gradient-to-r bg-gradient-to-t from-primary-50 to-white">
        <div class="sm:col-span-1 flex items-center justify-center">
            <img
                    src="/images/committees/business-committee.webp"
                    class="w-3/4 sm:w-full"
                    alt="Business Committee"
            />
        </div>
        <div class="sm:col-span-2">
            <h2 class="text-3xl mb-4 font-semibold font-primary">Business Committee</h2>
            <p class="mb-4"><span class="font-semibold">Business Committee</span>  is a committee under the Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University Branch, dedicated to organizing a spiritual upliftment and developmental program for Muslim students.</p>

            <p>This press is designed to keep you informed and inspired with the latest updates, insightful articles, and news about our community's spiritual, intellectual, and moral endeavors.</p>

            <p class="font-semibold mt-4">To Join <a class="text-green-800 underline" href="/our-excos#">Other Members</a> of Business Committee, <a class="text-green-800 underline" href="">Click here</a>.</p>
        </div>
    </div>
    <!--  End Committee  -->

    <!--  Committee  -->
    <div class="grid sm:grid-cols-3 w-full mt-8 gap-8 px-4 py-6 rounded-xl sm:border-r-4 border-t-4 sm:border-t-0 border-green-300 sm:bg-gradient-to-r bg-gradient-to-t from-white to-primary-50">
        <div class="sm:col-span-1 flex items-center justify-center">
            <img
                    src="/images/committees/an-nuur.webp"
                    class="w-3/4 sm:w-full"
                    alt="JWC Committee"
            />
        </div>
        <div class="sm:col-span-2">
            <h2 class="text-3xl mb-4 font-semibold font-primary">Welfare Committee</h2>
            <p class="mb-4"><span class="font-semibold">Welfare Committee</span> is a committee under the Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University Branch, dedicated to organizing a spiritual upliftment and developmental program for Muslim students.</p>

            <p>This press is designed to keep you informed and inspired with the latest updates, insightful articles, and news about our community's spiritual, intellectual, and moral endeavors.</p>

            <p class="font-semibold mt-4">To Join <a class="text-green-800 underline" href="/our-excos#">Other Members</a> of Welfare Committee, <a class="text-green-800 underline" href="">Click here</a>.</p>
        </div>
    </div>
    <!--  End Committee  -->

    <!--  Committee  -->
    <div class="grid sm:grid-cols-3 w-full mt-8 gap-8 px-4 py-6 rounded-xl sm:border-l-4 border-t-4 sm:border-t-0 border-green-300 sm:bg-gradient-to-r bg-gradient-to-t from-primary-50 to-white">
        <div class="sm:col-span-1 flex items-center justify-center">
            <img
                    src="/images/committees/jwc.webp"
                    class="w-3/4 sm:w-full"
                    alt="JWC Committee"
            />
        </div>
        <div class="sm:col-span-2">
            <h2 class="text-3xl mb-4 font-semibold font-primary">Academic Committee</h2>
            <p class="mb-4"><span class="font-semibold">The Academic Committee (JWC)</span> is a committee under the Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University Branch, dedicated to organizing a spiritual upliftment and developmental program for Muslim students.</p>

            <p class="font-semibold">Aim:</p>
            <ul class="list-disc ml-5">
                <li>To provide a platform for Muslim students to rejuvenate their faith and spiritual growth</li>
                <li>To empower Muslim students with knowledge, skills, and inspiration</li>
                <li>To foster a sense of community and brotherhood/sisterhood among Muslim students amongst others.</li>
            </ul>

            <p class="font-semibold mt-4">To Join <a class="text-green-800 underline" href="/our-excos#">Other Members</a> of Academic Committee, <a class="text-green-800 underline" href="">Click here</a>.</p>
        </div>
    </div>
    <!--  End Committee  -->

    <!--  Committee  -->
    <div class="grid sm:grid-cols-3 w-full mt-8 gap-8 px-4 py-6 rounded-xl sm:border-r-4 border-t-4 sm:border-t-0 border-green-300 sm:bg-gradient-to-r bg-gradient-to-t from-white to-primary-50">
        <div class="sm:col-span-1 flex items-center justify-center">
            <img
                    src="/images/committees/an-nuur.webp"
                    class="w-3/4 sm:w-full"
                    alt="JWC Committee"
            />
        </div>
        <div class="sm:col-span-2">
            <h2 class="text-3xl mb-4 font-semibold font-primary">ICT & Publicity Committee</h2>
            <p class="mb-4"><span class="font-semibold">ICT & Publicity Committee</span> is a committee under the Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University Branch, dedicated to organizing a spiritual upliftment and developmental program for Muslim students.</p>

            <p>This press is designed to keep you informed and inspired with the latest updates, insightful articles, and news about our community's spiritual, intellectual, and moral endeavors.</p>

            <p class="font-semibold mt-4">To Join <a class="text-green-800 underline" href="/our-excos#">Other Members</a> of ICT & Publicity Committee, <a class="text-green-800 underline" href="">Click here</a>.</p>
        </div>
    </div>
    <!--  End Committee  -->

    <!--  Committee  -->
    <div class="grid sm:grid-cols-3 w-full mt-8 gap-8 px-4 py-6 rounded-xl sm:border-l-4 border-t-4 sm:border-t-0 border-green-300 sm:bg-gradient-to-r bg-gradient-to-t from-primary-50 to-white">
        <div class="sm:col-span-1 flex items-center justify-center">
            <img
                    src="/images/committees/jwc.webp"
                    class="w-3/4 sm:w-full"
                    alt="JWC Committee"
            />
        </div>
        
        {#if committees.length > 3}
            <!-- View All Committees Button -->
            <div class="text-center mt-10">
                <button onclick={toggleShowAll} class="inline-flex items-center justify-center rounded-lg bg-primary-700 px-6 py-3 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors">
                    {#if showAll}
                        Show Less
                    {:else}
                        View All Committees
                    {/if}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </button>
            </div>
        {/if}
    {:else}
        <!-- Empty state for when no committees are available -->
        <div class="text-center py-10">
            <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">No Committees Available</h3>
            <p class="text-gray-500 max-w-md mx-auto">Committee information is currently unavailable. Please check back later.</p>
        </div>
    {/if}
</div>
<!-- End Our Committees -->