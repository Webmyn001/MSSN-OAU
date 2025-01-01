<script>
    import {toast} from "svelte-sonner";
</script>

<!-- ========== FOOTER ========== -->
<footer class="mt-auto bg-primary-50 w-full ">
    <div class="mt-auto w-full max-w-[85rem] py-10 px-4 sm:px-6 lg:px-8 lg:pt-20 mx-auto">
        <!-- Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <div class="col-span-full lg:col-span-1">
                <a class="flex-none text-xl font-semibold text-white focus:outline-none focus:opacity-80" href="/"
                   aria-label="MSSNOAU Logo">
                    <img src="/mssn-logo.png" class="h-8" alt="MSSNOAU Logo"/>
                </a>
            </div>
            <!-- End Col -->

            <div class="col-span-1">
                <h4 class="font-semibold text-primary-700 font-primary">About Us</h4>

                <div class="mt-3 grid space-y-3 font-secondary">
                    <p>
                        <a class="inline-flex gap-x-2 text-text-neutral-800 hover:text-text-neutral-700 focus:outline-none focus:text-text-neutral-700"
                           href="/about">About Us</a></p>
                    <p>
                        <a class="inline-flex gap-x-2 text-text-neutral-800 hover:text-text-neutral-700 focus:outline-none focus:text-text-neutral-700"
                           href="/our-excos">Our Excos</a></p>
                    <p>
                        <a class="inline-flex gap-x-2 text-text-neutral-800 hover:text-text-neutral-700 focus:outline-none focus:text-text-neutral-700"
                           href="/our-advisors">Our Advisors</a></p>
                    <p>
                        <a class="inline-flex gap-x-2 text-text-neutral-800 hover:text-text-neutral-700 focus:outline-none focus:text-text-neutral-700"
                           href="/contact">FAQs & Contact Us</a></p>
                    <p>
                        <a class="inline-flex gap-x-2 text-text-neutral-800 hover:text-text-neutral-700 focus:outline-none focus:text-text-neutral-700"
                           href="https://mssnoau.betteruptime.com/" aria-label="Status page" >
                            <iframe title="Status" src="https://mssnoau.betteruptime.com/badge?theme=light" width="250" height="30" ></iframe>
                        </a></p>
                </div>
            </div>
            <!-- End Col -->

            <div class="col-span-1">
                <h4 class="font-semibold text-primary-700 font-primary">Quick Links</h4>

                <div class="mt-3 grid space-y-3 font-secondary">
                    <p>
                        <a class="inline-flex gap-x-2 text-text-neutral-800 hover:text-text-neutral-700 focus:outline-none focus:text-text-neutral-700"
                           href="/blog">Blog</a></p>
                    <p>
                        <a class="inline-flex gap-x-2 text-text-neutral-800 hover:text-text-neutral-700 focus:outline-none focus:text-text-neutral-700"
                           href="/#donate">Donate</a></p>
                    <p>
                        <a class="inline-flex gap-x-2 text-text-neutral-800 hover:text-text-neutral-700 focus:outline-none focus:text-text-neutral-700"
                           href="/#prayer-times">Prayer Times</a></p>
                    <p>
                        <a class="inline-flex gap-x-2 text-text-neutral-800 hover:text-text-neutral-700 focus:outline-none focus:text-text-neutral-700"
                           href="/">Quiz</a></p>
                    <p>
                        <a class="inline-flex gap-x-2 text-text-neutral-800 hover:text-text-neutral-700 focus:outline-none focus:text-text-neutral-700"
                           href="/">E-Library</a></p>
                </div>
            </div>
            <!-- End Col -->

            <div class="col-span-2">
                <h4 class="font-semibold text-primary-700 font-primary">Join our Newsletter</h4>

                <form>
                    <div class="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:gap-3 bg-white rounded-xl p-2">
                        <div class="w-full">
                            <label for="hero-input" class="sr-only">Subscribe</label>
                            <input type="text" id="hero-input" name="hero-input"
                                   class="py-3 px-4 block w-full border-transparent rounded-xl text-sm focus:border-primary-700 focus:ring-primary-700 disabled:opacity-50 disabled:pointer-events-none"
                                   placeholder="Enter your email">
                        </div>
                        <button class="w-full font-secondary sm:w-auto whitespace-nowrap p-3 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-xl border border-transparent bg-primary-800 text-white hover:bg-primary-800 focus:outline-none focus:bg-primary-800 disabled:opacity-50 disabled:pointer-events-none"
                                onclick={() => toast.warning("Newsletter is currently unavailable.")}>
                            Subscribe
                        </button>
                    </div>
                    <p class="mt-3 text-sm font-secondary text-text-neutral-800">
                        Only Events, Blog Posts and Press Releases.
                    </p>
                </form>
            </div>
            <!-- End Col -->
        </div>
        <!-- End Grid -->

        <div class="mt-5 sm:mt-12 grid gap-y-2 sm:gap-y-0 sm:flex sm:justify-between sm:items-center">
            <div class="flex justify-between items-center">
                <p class="text-sm text-primary-950 font-secondary font-bold">
                    © {new Date().getFullYear()} MSSNOAU - The Muslim Student Society of Nigeria, Great Ìfẹ́.
                </p>
            </div>
            <!-- End Col -->

            <!-- Social Brands -->
            <div>
                <a aria-label="Facebook"
                   class="size-10 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-xl border border-transparent text-white hover:bg-[#0866FF]/80 focus:outline-none focus:bg-[#0866FF]/80 disabled:opacity-50 disabled:pointer-events-none"
                   href="https://facebook.com/mssnoau">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="shrink-0 size-4"
                         viewBox="0 0 32 32">
                        <path d="M16,2c-7.732,0-14,6.268-14,14,0,6.566,4.52,12.075,10.618,13.588v-9.31h-2.887v-4.278h2.887v-1.843c0-4.765,2.156-6.974,6.835-6.974,.887,0,2.417,.174,3.043,.348v3.878c-.33-.035-.904-.052-1.617-.052-2.296,0-3.183,.87-3.183,3.13v1.513h4.573l-.786,4.278h-3.787v9.619c6.932-.837,12.304-6.74,12.304-13.897,0-7.732-6.268-14-14-14Z"></path>
                    </svg>
                </a>
                <a aria-label="X (formerly twitter)"
                   class="size-10 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-xl border border-transparent text-white hover:bg-[#000000]/80 focus:outline-none focus:bg-[#000000]/80 disabled:opacity-50 disabled:pointer-events-none"
                   href="https://x.com/Mssngreatife1">
                    <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                         viewBox="0 0 32 32">
                        <path d="M18.42,14.009L27.891,3h-2.244l-8.224,9.559L10.855,3H3.28l9.932,14.455L3.28,29h2.244l8.684-10.095,6.936,10.095h7.576l-10.301-14.991h0Zm-3.074,3.573l-1.006-1.439L6.333,4.69h3.447l6.462,9.243,1.006,1.439,8.4,12.015h-3.447l-6.854-9.804h0Z"></path>
                    </svg>
                </a>
                <a aria-label="Instagram"
                   class="size-10 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-xl border border-transparent text-white hover:bg-[#FF0069]/80 focus:outline-none focus:bg-[#FF0069]/80 disabled:opacity-50 disabled:pointer-events-none"
                   href="https://www.instagram.com/mssn_oau">
                    <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                         viewBox="0 0 32 32">
                        <path d="M10.202,2.098c-1.49,.07-2.507,.308-3.396,.657-.92,.359-1.7,.84-2.477,1.619-.776,.779-1.254,1.56-1.61,2.481-.345,.891-.578,1.909-.644,3.4-.066,1.49-.08,1.97-.073,5.771s.024,4.278,.096,5.772c.071,1.489,.308,2.506,.657,3.396,.359,.92,.84,1.7,1.619,2.477,.779,.776,1.559,1.253,2.483,1.61,.89,.344,1.909,.579,3.399,.644,1.49,.065,1.97,.08,5.771,.073,3.801-.007,4.279-.024,5.773-.095s2.505-.309,3.395-.657c.92-.36,1.701-.84,2.477-1.62s1.254-1.561,1.609-2.483c.345-.89,.579-1.909,.644-3.398,.065-1.494,.081-1.971,.073-5.773s-.024-4.278-.095-5.771-.308-2.507-.657-3.397c-.36-.92-.84-1.7-1.619-2.477s-1.561-1.254-2.483-1.609c-.891-.345-1.909-.58-3.399-.644s-1.97-.081-5.772-.074-4.278,.024-5.771,.096m.164,25.309c-1.365-.059-2.106-.286-2.6-.476-.654-.252-1.12-.557-1.612-1.044s-.795-.955-1.05-1.608c-.192-.494-.423-1.234-.487-2.599-.069-1.475-.084-1.918-.092-5.656s.006-4.18,.071-5.656c.058-1.364,.286-2.106,.476-2.6,.252-.655,.556-1.12,1.044-1.612s.955-.795,1.608-1.05c.493-.193,1.234-.422,2.598-.487,1.476-.07,1.919-.084,5.656-.092,3.737-.008,4.181,.006,5.658,.071,1.364,.059,2.106,.285,2.599,.476,.654,.252,1.12,.555,1.612,1.044s.795,.954,1.051,1.609c.193,.492,.422,1.232,.486,2.597,.07,1.476,.086,1.919,.093,5.656,.007,3.737-.006,4.181-.071,5.656-.06,1.365-.286,2.106-.476,2.601-.252,.654-.556,1.12-1.045,1.612s-.955,.795-1.608,1.05c-.493,.192-1.234,.422-2.597,.487-1.476,.069-1.919,.084-5.657,.092s-4.18-.007-5.656-.071M21.779,8.517c.002,.928,.755,1.679,1.683,1.677s1.679-.755,1.677-1.683c-.002-.928-.755-1.679-1.683-1.677,0,0,0,0,0,0-.928,.002-1.678,.755-1.677,1.683m-12.967,7.496c.008,3.97,3.232,7.182,7.202,7.174s7.183-3.232,7.176-7.202c-.008-3.97-3.233-7.183-7.203-7.175s-7.182,3.233-7.174,7.203m2.522-.005c-.005-2.577,2.08-4.671,4.658-4.676,2.577-.005,4.671,2.08,4.676,4.658,.005,2.577-2.08,4.671-4.658,4.676-2.577,.005-4.671-2.079-4.676-4.656h0"></path>
                    </svg>
                </a>
                <a aria-label="YouTube"
                   class="size-10 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-xl border border-transparent text-white hover:bg-[#FF0000]/80 focus:outline-none focus:bg-[#FF0000]/80 disabled:opacity-50 disabled:pointer-events-none"
                   href="/">
                    <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                         viewBox="0 0 32 32">
                        <path d="M31.331,8.248c-.368-1.386-1.452-2.477-2.829-2.848-2.496-.673-12.502-.673-12.502-.673,0,0-10.007,0-12.502,.673-1.377,.37-2.461,1.462-2.829,2.848-.669,2.512-.669,7.752-.669,7.752,0,0,0,5.241,.669,7.752,.368,1.386,1.452,2.477,2.829,2.847,2.496,.673,12.502,.673,12.502,.673,0,0,10.007,0,12.502-.673,1.377-.37,2.461-1.462,2.829-2.847,.669-2.512,.669-7.752,.669-7.752,0,0,0-5.24-.669-7.752ZM12.727,20.758V11.242l8.364,4.758-8.364,4.758Z"></path>
                    </svg>
                </a>
            </div>
            <!-- End Social Brands -->
        </div>
    </div>
</footer>
<!-- ========== END FOOTER ========== -->