<script>
    export let wrapperClass = "mt-12 max-w-lg mx-auto"
</script>
<div class={wrapperClass}>
    <!-- Card -->
    <div id="form" class="flex flex-col border rounded-xl p-4 sm:p-6 lg:p-8">
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