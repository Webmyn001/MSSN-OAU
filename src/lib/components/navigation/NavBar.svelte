<script>
    import { slide } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';

    let isOpen = false;
    let isDropdownOpen = false;

    function toggleNav() {
        isOpen = !isOpen;
    }

    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
    }

    function clickOutside(node, handler) {
        const handleClick = (event) => {
            if (!node.contains(event.target)) {
                handler();
            }
        };

        document.addEventListener('click', handleClick, true);

        return {
            destroy() {
                document.removeEventListener('click', handleClick, true);
            }
        };
    }

    /**
     * @type {number}
     */
    let innerWidth;
</script>

<header class="flex flex-wrap lg:justify-start lg:flex-nowrap z-50 w-full bg-white text-sm py-3 lg:py-0 shadow-sm border-b border-gray-100">
    <nav class="max-w-[85rem] w-full mx-auto px-4 md:px-6 lg:px-8">
        <div class="relative lg:flex lg:items-center">
            <div class="flex items-center justify-between w-full lg:w-auto">
                <a class="flex-none font-semibold text-xl" href="/" aria-label="MSSNOAU">
                    <img 
                      src="/mssn-logo.webp" 
                      width="240" 
                      height="45"
                      class="my-4 h-10 lg:h-12 w-auto max-w-[200px] lg:max-w-[240px] object-contain" 
                      alt="mssnoau logo"
                      fetchpriority="high"
                      loading="eager" 
                    />
                </a>

                <button
                  type="button"
                  class="lg:hidden p-2 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                  onclick={toggleNav}
                  aria-expanded={isOpen}
                  aria-controls="navbar-menu"
                  aria-label="Toggle navigation"
                >
                    {#if !isOpen}
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
                    {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    {/if}
                </button>
            </div>

            {#if isOpen || innerWidth >= 1024}
                <div
                  id="navbar-menu"
                  class="w-full lg:block z-[51]"
                  transition:slide={{duration: 300, easing: cubicOut}}
                >
                    <div class="flex flex-col gap-y-3 lg:gap-y-0 mt-5 lg:flex-row lg:items-center lg:justify-end lg:mt-0 lg:ps-5">
                        <a class="lg:p-2 font-medium font-secondary text-primary hover:text-primary-600 transition-colors" href="/" aria-current="page">Home</a>
                        <a class="lg:p-2 font-medium font-secondary text-gray-700 hover:text-primary transition-colors" href="/about">About Us</a>
                        <a class="lg:p-2 font-medium font-secondary text-gray-700 hover:text-primary transition-colors" href="/blog">Blog</a>
                        <a class="lg:p-2 font-medium font-secondary text-gray-700 hover:text-primary transition-colors" href="/events">Events</a>
                        <a class="lg:p-2 font-medium font-secondary text-gray-700 hover:text-primary transition-colors" href="/#donate">Donate</a>
                        <a class="lg:p-2 font-medium font-secondary text-gray-700 hover:text-primary transition-colors" href="/#prayer-times">Prayer Times</a>

                        <div class="relative" use:clickOutside={() => isDropdownOpen = false}>
                            <button
                              type="button"
                              class="lg:p-2 flex items-center w-full font-secondary font-medium text-gray-700 hover:text-primary transition-colors"
                              onclick={toggleDropdown}
                              aria-expanded={isDropdownOpen}
                              aria-haspopup="true"
                            >
                                More
                                <svg
                                  class="ms-2 size-4 transition-transform duration-300 {isDropdownOpen ? 'rotate-180' : ''}"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                >
                                    <path d="m6 9 6 6 6-6"/>
                                </svg>
                            </button>

                            {#if isDropdownOpen}
                                <div
                                  class="absolute z-[52] right-0 mt-2 w-64 lg:w-auto bg-white shadow-lg rounded-xl py-2 px-2"
                                  transition:slide={{duration: 200, easing: cubicOut}}
                                  role="menu"
                                >
                                    <div class="lg:grid lg:grid-cols-3 lg:min-w-[600px]">
                                        <div class="flex flex-col">
                                            <a class="flex items-center py-2 px-3 rounded-xl text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors" href="/our-excos">Our Executives</a>
                                            <a class="flex items-center py-2 px-3 rounded-xl text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors" href="/our-advisors">Our Advisers</a>
                                            <a class="flex items-center py-2 px-3 rounded-xl text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors" href="/alumnae">Alumnae</a>
                                        </div>

                                        <div class="flex flex-col">
                                            <a class="flex items-center py-2 px-3 rounded-xl text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors" href="https://quiz.mssnoau.org">Quiz</a>
                                            <a class="flex items-center py-2 px-3 rounded-xl text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors" href="https://library.mssnoau.org">E-Library</a>
                                            <a class="flex items-center py-2 px-3 rounded-xl text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors" href="/annual-dues">Annual Dues</a>
                                        </div>

                                        <div class="flex flex-col">
                                            <a class="flex items-center py-2 px-3 rounded-xl text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors" href="/contact#faqs">FAQs</a>
                                            <a class="flex items-center py-2 px-3 rounded-xl text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors" href="/auth/login">Log In</a>
                                            <a class="flex items-center py-2 px-3 rounded-xl text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors" href="/auth/signup">Sign Up</a>
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        </div>

                        <a class="lg:p-2 font-medium font-secondary text-gray-700 hover:text-primary transition-colors" href="/contact">Contact Us</a>
                    </div>
                </div>
            {/if}
        </div>
    </nav>
</header>

<svelte:window
  bind:innerWidth
  onresize={() => {
    if (window.innerWidth >= 1024) {
      isOpen = false;
      isDropdownOpen = false;
    }
  }}
/>

