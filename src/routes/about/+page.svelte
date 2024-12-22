<script>
    import PageHeader from "$lib/components/PageHeader.svelte";
    import {MetaTags} from "svelte-meta-tags";
</script>


<!-- Meta Tags -->
<MetaTags
        title="About Us"
        titleTemplate="%s | MSSNOAU"
        description="Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University."
        canonical="https://mssnoau-frontend.vercel.app/alumnae"
        openGraph={{
    url: 'https://mssnoau-frontend.vercel.app/alumnae',
    title: 'About Us | MSSNOAU',
    description: 'Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University.',
    images: [
      {
        url: 'https://i.ibb.co/H7t1bv3/about.jpg',
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
    About MSSNOAU
</PageHeader>

<!-- Who We Are -->
<div class="mt-8 mx-[10dvw] flex items-center flex-col">
    <h3 class="font-semibold text-2xl sm:text-3xl font-secondary mb-4">WHO WE ARE</h3>
    <p class="font-tertiary w-full text-center">The Muslim Students Society of Nigeria (MSSN), Obafemi Awolowo University (MSSNOAU) ia a branch among MSSN higher institution branches and is an inclusive platform for all Muslim students in the university to find spiritual expression, islamic knowledge, and fellowship irrespective of their backgrounds and orientation.</p>
    <br /><br />
    <p class="font-tertiary w-full text-center">At MSSNOAU, we foster a vibrant and inclusive community where every member is encouraged to grow and excel. Our diverse programs and activities are designed to cater to the holistic development of our members, ensuring they achieve academic excellence while maintaining strong spiritual and moral values.</p>
</div>
<!-- End Who We are -->

<!-- Mission and Vision -->
<div class="w-full mx-auto flex items-center flex-col mt-8 px-[10dvw]">
    <img src="/mssn-logo.png" alt="MSSNOAU Logo" class="w-[40dvw] p-6 border border-gray-200 rounded-xl" />
    <div class="grid grid-rows-1 sm:grid-cols-2 gap-8 text-center mt-8">
        <div class="flex flex-col gap-2">
            <h4 class="font-secondary text-green-800 text-2xl font-semibold mb-2">Our Mission</h4>
            <p class="font-tertiary text-center leading-relaxed">
                To work relentlessly towards the establishment of a society that fosters all-around human development. To achieve this, MSSN will continuously strive towards strengthening Ummah educationally, emotionally, spiritually and politically through a wide spectrum of activities in the university and the larger society in partnership with like-minded organizations. To succeed, MSSN must ensure that its members are God-fearing, knowledgeable, united and with superior moral values.
            </p>
        </div>

        <div class="flex flex-col gap-2">
            <h4 class="font-secondary text-green-800 text-2xl font-semibold mb-2">Our Vision</h4>
            <p class="font-tertiary text-center leading-relaxed">
                To establish an Islamic Ummah governed by the principles and rules of the Shariah. To become a leading student organization that inspires Muslim students to become dynamic leaders, passionate about their faith, knowledge, and community, and to create a supportive environment that nurtures their overall well-being and success.
            </p>
        </div>
    </div>
</div>
<!-- End Mission and Vision -->


<!-- Our Committees -->
<div class="mt-12 mb-8 mx-[10dvw] flex items-center flex-col">
    <h3 class="font-semibold text-2xl sm:text-3xl font-secondary mb-4">Our Committees</h3>
    <p class="font-tertiary w-full text-center">The Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University Branch, has established various committees to cater to the diverse needs of Muslim students on campus. Here at MSSN OAU, we also established this committee so that students can join just to gain other extraordinary activities. This will allow them to be useful for the society and community at large.</p>

    <!--  Committee  -->
    <div class="grid sm:grid-cols-3 w-full mt-8 gap-8 px-4 py-6 rounded-xl sm:border-l-4 border-t-4 sm:border-t-0 border-green-300 sm:bg-gradient-to-r bg-gradient-to-t from-primary-50 to-white">
        <div class="sm:col-span-1 flex items-center justify-center">
            <img
                    src="/images/committees/jwc.png"
                    class="w-3/4 sm:w-full"
                    alt="JWC Committee"
            />
        </div>
        <div class="sm:col-span-2">
            <h2 class="text-3xl mb-4 font-semibold font-primary">Jihad Week Committee (JWC)</h2>
            <p class="mb-4"><span class="font-semibold">The Jihad Week Committee (JWC)</span> is a committee under the Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University Branch, dedicated to organizing a spiritual upliftment and developmental program for Muslim students.</p>

            <p class="font-semibold">Aim:</p>
            <ul class="list-disc ml-5">
                <li>To provide a platform for Muslim students to rejuvenate their faith and spiritual growth</li>
                <li>To empower Muslim students with knowledge, skills, and inspiration</li>
                <li>To foster a sense of community and brotherhood/sisterhood among Muslim students amongst others.</li>
            </ul>

            <p class="font-semibold mt-4">To Join <a class="text-green-800 underline" href="/our-excos#">Other Members</a> of Jihad Week Committee, <a class="text-green-800 underline" href="">Click here</a>.</p>
        </div>
    </div>
    <!--  End Committee  -->

    <!--  Committee  -->
    <div class="grid sm:grid-cols-3 w-full mt-8 gap-8 px-4 py-6 rounded-xl sm:border-r-4 border-t-4 sm:border-t-0 border-green-300 sm:bg-gradient-to-r bg-gradient-to-t from-white to-primary-50">
        <div class="sm:col-span-1 flex items-center justify-center">
            <img
                    src="/images/committees/an-nuur.png"
                    class="w-3/4 sm:w-full"
                    alt="JWC Committee"
            />
        </div>
        <div class="sm:col-span-2">
            <h2 class="text-3xl mb-4 font-semibold font-primary">An-Nur Press Agency Editorial Board</h2>
            <p class="mb-4"><span class="font-semibold">An-Nur Press Agency Editorial Board</span> is a committee under the Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University Branch, dedicated to organizing a spiritual upliftment and developmental program for Muslim students.</p>

            <p>This press is designed to keep you informed and inspired with the latest updates, insightful articles, and news about our community’s spiritual, intellectual, and moral endeavors.</p>

            <p class="font-semibold mt-4">To Join <a class="text-green-800 underline" href="/our-excos#">Other Members</a> of An-Nur Press Agency Editorial Board, <a class="text-green-800 underline" href="">Click here</a>.</p>
        </div>
    </div>
    <!--  End Committee  -->

    <!--  Committee  -->
    <div class="grid sm:grid-cols-3 w-full mt-8 gap-8 px-4 py-6 rounded-xl sm:border-l-4 border-t-4 sm:border-t-0 border-green-300 sm:bg-gradient-to-r bg-gradient-to-t from-primary-50 to-white">
        <div class="sm:col-span-1 flex items-center justify-center">
            <img
                    src="/images/committees/business-committee.jpg"
                    class="w-3/4 sm:w-full"
                    alt="Business Committee"
            />
        </div>
        <div class="sm:col-span-2">
            <h2 class="text-3xl mb-4 font-semibold font-primary">Business Committee</h2>
            <p class="mb-4"><span class="font-semibold">Business Committee</span>  is a committee under the Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University Branch, dedicated to organizing a spiritual upliftment and developmental program for Muslim students.</p>

            <p>This press is designed to keep you informed and inspired with the latest updates, insightful articles, and news about our community’s spiritual, intellectual, and moral endeavors.</p>

            <p class="font-semibold mt-4">To Join <a class="text-green-800 underline" href="/our-excos#">Other Members</a> of Business Committee, <a class="text-green-800 underline" href="">Click here</a>.</p>
        </div>
    </div>
    <!--  End Committee  -->

    <!--  Committee  -->
    <div class="grid sm:grid-cols-3 w-full mt-8 gap-8 px-4 py-6 rounded-xl sm:border-r-4 border-t-4 sm:border-t-0 border-green-300 sm:bg-gradient-to-r bg-gradient-to-t from-white to-primary-50">
        <div class="sm:col-span-1 flex items-center justify-center">
            <img
                    src="/images/committees/an-nuur.png"
                    class="w-3/4 sm:w-full"
                    alt="JWC Committee"
            />
        </div>
        <div class="sm:col-span-2">
            <h2 class="text-3xl mb-4 font-semibold font-primary">Welfare Committee</h2>
            <p class="mb-4"><span class="font-semibold">Welfare Committee</span> is a committee under the Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University Branch, dedicated to organizing a spiritual upliftment and developmental program for Muslim students.</p>

            <p>This press is designed to keep you informed and inspired with the latest updates, insightful articles, and news about our community’s spiritual, intellectual, and moral endeavors.</p>

            <p class="font-semibold mt-4">To Join <a class="text-green-800 underline" href="/our-excos#">Other Members</a> of Welfare Committee, <a class="text-green-800 underline" href="">Click here</a>.</p>
        </div>
    </div>
    <!--  End Committee  -->

    <!--  Committee  -->
    <div class="grid sm:grid-cols-3 w-full mt-8 gap-8 px-4 py-6 rounded-xl sm:border-l-4 border-t-4 sm:border-t-0 border-green-300 sm:bg-gradient-to-r bg-gradient-to-t from-primary-50 to-white">
        <div class="sm:col-span-1 flex items-center justify-center">
            <img
                    src="/images/committees/jwc.png"
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
                    src="/images/committees/an-nuur.png"
                    class="w-3/4 sm:w-full"
                    alt="JWC Committee"
            />
        </div>
        <div class="sm:col-span-2">
            <h2 class="text-3xl mb-4 font-semibold font-primary">ICT & Publicity Committee</h2>
            <p class="mb-4"><span class="font-semibold">ICT & Publicity Committee</span> is a committee under the Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University Branch, dedicated to organizing a spiritual upliftment and developmental program for Muslim students.</p>

            <p>This press is designed to keep you informed and inspired with the latest updates, insightful articles, and news about our community’s spiritual, intellectual, and moral endeavors.</p>

            <p class="font-semibold mt-4">To Join <a class="text-green-800 underline" href="/our-excos#">Other Members</a> of ICT & Publicity Committee, <a class="text-green-800 underline" href="">Click here</a>.</p>
        </div>
    </div>
    <!--  End Committee  -->

    <!--  Committee  -->
    <div class="grid sm:grid-cols-3 w-full mt-8 gap-8 px-4 py-6 rounded-xl sm:border-l-4 border-t-4 sm:border-t-0 border-green-300 sm:bg-gradient-to-r bg-gradient-to-t from-primary-50 to-white">
        <div class="sm:col-span-1 flex items-center justify-center">
            <img
                    src="/images/committees/jwc.png"
                    class="w-3/4 sm:w-full"
                    alt="JWC Committee"
            />
        </div>
        <div class="sm:col-span-2">
            <h2 class="text-3xl mb-4 font-semibold font-primary">Mosque Cleaning Committee</h2>
            <p class="mb-4"><span class="font-semibold">The Mosque Cleaning Committee</span> is a committee under the Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University Branch, dedicated to organizing a spiritual upliftment and developmental program for Muslim students.</p>

            <p class="font-semibold">Aim:</p>
            <ul class="list-disc ml-5">
                <li>To provide a platform for Muslim students to rejuvenate their faith and spiritual growth</li>
                <li>To empower Muslim students with knowledge, skills, and inspiration</li>
                <li>To foster a sense of community and brotherhood/sisterhood among Muslim students amongst others.</li>
            </ul>

            <p class="font-semibold mt-4">To Join <a class="text-green-800 underline" href="/our-excos#">Other Members</a> of Mosque Cleaning Committee, <a class="text-green-800 underline" href="">Click here</a>.</p>
        </div>
    </div>
    <!--  End Committee  -->

    <!--  Committee  -->
    <div class="grid sm:grid-cols-3 w-full mt-8 gap-8 px-4 py-6 rounded-xl sm:border-r-4 border-t-4 sm:border-t-0 border-green-300 sm:bg-gradient-to-r bg-gradient-to-t from-white to-primary-50">
        <div class="sm:col-span-1 flex items-center justify-center">
            <img
                    src="/images/committees/an-nuur.png"
                    class="w-3/4 sm:w-full"
                    alt="JWC Committee"
            />
        </div>
        <div class="sm:col-span-2">
            <h2 class="text-3xl mb-4 font-semibold font-primary">Moro Committee</h2>
            <p class="mb-4"><span class="font-semibold">Moro Committee</span> is a committee under the Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University Branch, dedicated to organizing a spiritual upliftment and developmental program for Muslim students.</p>

            <p>This press is designed to keep you informed and inspired with the latest updates, insightful articles, and news about our community’s spiritual, intellectual, and moral endeavors.</p>

            <p class="font-semibold mt-4">To Join <a class="text-green-800 underline" href="/our-excos#">Other Members</a> of Moro Committee, <a class="text-green-800 underline" href="">Click here</a>.</p>
        </div>
    </div>
    <!--  End Committee  -->

    <!--  Committee  -->
    <div class="grid sm:grid-cols-3 w-full mt-8 gap-8 px-4 py-6 rounded-xl sm:border-l-4 border-t-4 sm:border-t-0 border-green-300 sm:bg-gradient-to-r bg-gradient-to-t from-primary-50 to-white">
        <div class="sm:col-span-1 flex items-center justify-center">
            <img
                    src="/images/committees/jwc.png"
                    class="w-3/4 sm:w-full"
                    alt="JWC Committee"
            />
        </div>
        <div class="sm:col-span-2">
            <h2 class="text-3xl mb-4 font-semibold font-primary">Secondary School Committee</h2>
            <p class="mb-4"><span class="font-semibold">The Secondary School Committee</span> is a committee under the Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University Branch, dedicated to organizing a spiritual upliftment and developmental program for Muslim students.</p>

            <p class="font-semibold">Aim:</p>
            <ul class="list-disc ml-5">
                <li>To provide a platform for Muslim students to rejuvenate their faith and spiritual growth</li>
                <li>To empower Muslim students with knowledge, skills, and inspiration</li>
                <li>To foster a sense of community and brotherhood/sisterhood among Muslim students amongst others.</li>
            </ul>

            <p class="font-semibold mt-4">To Join <a class="text-green-800 underline" href="/our-excos#">Other Members</a> of Asset Secondary School Committee, <a class="text-green-800 underline" href="">Click here</a>.</p>
        </div>
    </div>
    <!--  End Committee  -->

    <!--  Committee  -->
    <div class="grid sm:grid-cols-3 w-full mt-8 gap-8 px-4 py-6 rounded-xl sm:border-r-4 border-t-4 sm:border-t-0 border-green-300 sm:bg-gradient-to-r bg-gradient-to-t from-white to-primary-50">
        <div class="sm:col-span-1 flex items-center justify-center">
            <img
                    src="/images/committees/an-nuur.png"
                    class="w-3/4 sm:w-full"
                    alt="JWC Committee"
            />
        </div>
        <div class="sm:col-span-2">
            <h2 class="text-3xl mb-4 font-semibold font-primary">Asset Maintenance Office</h2>
            <p class="mb-4"><span class="font-semibold">Asset Maintenance Office</span> is a committee under the Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University Branch, dedicated to organizing a spiritual upliftment and developmental program for Muslim students.</p>

            <p>This press is designed to keep you informed and inspired with the latest updates, insightful articles, and news about our community’s spiritual, intellectual, and moral endeavors.</p>

            <p class="font-semibold mt-4">To Join <a class="text-green-800 underline" href="/our-excos#">Other Members</a> of Asset Maintenance Office, <a class="text-green-800 underline" href="">Click here</a>.</p>
        </div>
    </div>
    <!--  End Committee  -->

    <!--  Committee  -->
    <div class="grid sm:grid-cols-3 w-full mt-8 gap-8 px-4 py-6 rounded-xl sm:border-l-4 border-t-4 sm:border-t-0 border-green-300 sm:bg-gradient-to-r bg-gradient-to-t from-primary-50 to-white">
        <div class="sm:col-span-1 flex items-center justify-center">
            <img
                    src="/images/committees/jwc.png"
                    class="w-3/4 sm:w-full"
                    alt="JWC Committee"
            />
        </div>
        <div class="sm:col-span-2">
            <h2 class="text-3xl mb-4 font-semibold font-primary">Ramadan Committee</h2>
            <p class="mb-4"><span class="font-semibold">The Ramadan Committee</span> is a committee under the Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University Branch, dedicated to organizing a spiritual upliftment and developmental program for Muslim students.</p>

            <p class="font-semibold">Aim:</p>
            <ul class="list-disc ml-5">
                <li>To provide a platform for Muslim students to rejuvenate their faith and spiritual growth</li>
                <li>To empower Muslim students with knowledge, skills, and inspiration</li>
                <li>To foster a sense of community and brotherhood/sisterhood among Muslim students amongst others.</li>
            </ul>

            <p class="font-semibold mt-4">To Join <a class="text-green-800 underline" href="/our-excos#">Other Members</a> of Ramadan Committee, <a class="text-green-800 underline" href="">Click here</a>.</p>
        </div>
    </div>
    <!--  End Committee  -->

    <!--  Committee  -->
    <div class="grid sm:grid-cols-3 w-full mt-8 gap-8 px-4 py-6 rounded-xl sm:border-r-4 border-t-4 sm:border-t-0 border-green-300 sm:bg-gradient-to-r bg-gradient-to-t from-white to-primary-50">
        <div class="sm:col-span-1 flex items-center justify-center">
            <img
                    src="/images/committees/an-nuur.png"
                    class="w-3/4 sm:w-full"
                    alt="JWC Committee"
            />
        </div>
        <div class="sm:col-span-2">
            <h2 class="text-3xl mb-4 font-semibold font-primary">Islamic Affairs Committee</h2>
            <p class="mb-4"><span class="font-semibold">Islamic Affairs Committee</span> is a committee under the Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University Branch, dedicated to organizing a spiritual upliftment and developmental program for Muslim students.</p>

            <p>This press is designed to keep you informed and inspired with the latest updates, insightful articles, and news about our community’s spiritual, intellectual, and moral endeavors.</p>

            <p class="font-semibold mt-4">To Join <a class="text-green-800 underline" href="/our-excos#">Other Members</a> of Islamic Affairs Committee, <a class="text-green-800 underline" href="">Click here</a>.</p>
        </div>
    </div>
    <!--  End Committee  -->



</div>
<!-- End Our Committees -->