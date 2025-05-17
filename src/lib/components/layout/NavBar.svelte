<script>
    import { slide } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import { page } from '$app/state';
    import { afterNavigate } from '$app/navigation';
    import {
        ArrowLeft,
        Menu,
        X
    } from '@lucide/svelte'
    import {onMount} from 'svelte'
    import { Image } from '$lib/components/ui/image';
    import { browser } from '$app/environment';

    let isOpen = $state(false);
    let isDropdownOpen = $state(false);

    // Track active path for highlighting current page
    /** @type {string} */
    let currentPath = $state(page?.url?.pathname || '/');

    function toggleNav() {
        isOpen = !isOpen;
    }

    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
    }

    /**
     * @param {EventTarget | null} node
     * @param {() => void} handler
     */
    function clickOutside(node, handler) {
        /** @param {MouseEvent} event */
        const handleClick = (event) => {
            if (node && event.target && !node.contains(/** @type {Node} */ (event.target))) {
                handler();
            }
        };

        if (browser) {
            document.addEventListener('click', handleClick, true);
        }

        return {
            destroy() {
                if (browser) {
                    document.removeEventListener('click', handleClick, true);
                }
            }
        };
    }

    // Check if a given path is active
    /**
     * @param {string} path
     * @returns {boolean}
     */
    function isActive(path) {
        if (path === '/') {
            return currentPath === path;
        }
        return currentPath.startsWith(path);
    }

    /** @type {number} */
    let innerWidth = $state(browser ? window.innerWidth : 0);

    afterNavigate(() => {
        currentPath = page?.url?.pathname || '/';
        isOpen = false;
        isDropdownOpen = false;
    });

    $effect(() => {
        if (browser) {
            const updateWidth = () => {
                innerWidth = window.innerWidth;
                if (window.innerWidth >= 1024) {
                    isOpen = false;
                    isDropdownOpen = false;
                }
            };
            window.addEventListener('resize', updateWidth);
            return () => window.removeEventListener('resize', updateWidth);
        }
    });
</script>

<header class="flex flex-wrap lg:justify-start lg:flex-nowrap z-50 w-full py-3 lg:py-0 border-b bg-gradient-to-r from-white via-white to-primary-50 shadow-md">
    <!-- Decorative Islamic pattern - top border -->
    <div class="absolute top-0 left-0 w-full h-1 bg-primary-600"></div>
    
    <nav class="max-w-[85rem] w-full mx-auto px-4 md:px-6 lg:px-8">
        <div class="relative lg:flex lg:items-center">
            <div class="flex items-center justify-between w-full lg:w-auto">
                <div class="relative flex items-center">
                    <!-- Logo -->
                    <a class="flex-none flex items-center gap-2 py-2" href="/" aria-label="MSSNOAU">
                        <div class="relative">
                            <Image 
                              src="/mssn-logo.webp" 
                              width={240} 
                              height={45}
                              className="my-4 h-10 lg:h-12 w-auto max-w-[200px] lg:max-w-[240px] object-contain transition-transform hover:scale-105 duration-300" 
                              alt="MSSNOAU logo"
                              fetchpriority="high"
                              loading="eager" 
                            />
                            <div class="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary-600 rounded-full"></div>
                        </div>
                        <span class="sr-only">Muslim Students Society of Nigeria, OAU Branch</span>
                    </a>
                    <!-- End Logo -->
                </div>

                <button
                  type="button"
                  class="lg:hidden p-2 inline-flex items-center justify-center rounded-xl border border-primary-200 bg-white text-primary-800 hover:bg-primary-50"
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
                  class="w-full lg:block lg:h-auto z-[51] {isOpen ? 'bg-white pb-5 lg:pb-0' : ''}"
                >
                    <div class="flex flex-col gap-y-3 lg:gap-y-0 mt-5 lg:flex-row lg:items-center lg:justify-end lg:mt-0 lg:ps-5">
                        <!-- Navigation Links -->
                        <a 
                            class="lg:px-3 lg:py-5 font-medium font-secondary relative text-gray-700 hover:text-primary-700 transition-colors ease-in-out duration-200 flex gap-1.5 items-center {isActive('/') ? 'text-primary-700' : ''}" 
                            href="/" 
                            aria-current={isActive('/') ? 'page' : undefined}
                        >
                            <span>Home</span>
                            {#if isActive('/')}
                                <div class="absolute bottom-0 left-0 w-full h-1 bg-primary-600 hidden lg:block"></div>
                            {/if}
                        </a>
                        
                        <a 
                            class="lg:px-3 lg:py-5 font-medium font-secondary relative text-gray-700 hover:text-primary-700 transition-colors ease-in-out duration-200 flex gap-1.5 items-center {isActive('/about') ? 'text-primary-700' : ''}" 
                            href="/about"
                            aria-current={isActive('/about') ? 'page' : undefined}
                        >
                            <span>About Us</span>
                            {#if isActive('/about')}
                                <div class="absolute bottom-0 left-0 w-full h-1 bg-primary-600 hidden lg:block"></div>
                            {/if}
                        </a>
                        
                        <a 
                            class="lg:px-3 lg:py-5 font-medium font-secondary relative text-gray-700 hover:text-primary-700 transition-colors ease-in-out duration-200 flex gap-1.5 items-center {isActive('/blog') ? 'text-primary-700' : ''}" 
                            href="/blog"
                            aria-current={isActive('/blog') ? 'page' : undefined}
                        >
                            <span>Blog</span>
                            {#if isActive('/blog')}
                                <div class="absolute bottom-0 left-0 w-full h-1 bg-primary-600 hidden lg:block"></div>
                            {/if}
                        </a>
                        
                        <a 
                            class="lg:px-3 lg:py-5 font-medium font-secondary relative text-gray-700 hover:text-primary-700 transition-colors ease-in-out duration-200 flex gap-1.5 items-center {isActive('/events') ? 'text-primary-700' : ''}" 
                            href="/events"
                            aria-current={isActive('/events') ? 'page' : undefined}
                        >
                            <span>Events</span>
                            {#if isActive('/events')}
                                <div class="absolute bottom-0 left-0 w-full h-1 bg-primary-600 hidden lg:block"></div>
                            {/if}
                        </a>
                        
                        <a 
                            class="lg:px-3 lg:py-5 font-medium font-secondary relative text-gray-700 hover:text-primary-700 transition-colors ease-in-out duration-200 flex gap-1.5 items-center" 
                            href="/#donate"
                        >
                            <span>Donate</span>
                        </a>
                        
                        <a 
                            class="lg:px-3 lg:py-5 font-medium font-secondary relative text-gray-700 hover:text-primary-700 transition-colors ease-in-out duration-200 flex gap-1.5 items-center" 
                            href="/#prayer-times"
                        >
                            <span>Prayer Times</span>
                        </a>

                        <div class="relative" use:clickOutside={() => isDropdownOpen = false}>
                            <button
                              type="button"
                              class="lg:px-3 lg:py-5 flex items-center w-full font-secondary font-medium text-gray-700 hover:text-primary-700 transition-colors ease-in-out duration-200"
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
                                  class="absolute z-[52] right-0 mt-2 w-64 lg:w-auto bg-white/95 backdrop-blur-md shadow-[0_15px_35px_-5px_rgba(0,0,0,0.15)] border border-primary-100/50 rounded-xl py-3 px-3 transition-all duration-300 transform origin-top-right"
                                  role="menu"
                                >
                                    <div class="lg:grid lg:grid-cols-3 lg:gap-4 lg:min-w-[600px]">
                                        <div class="flex flex-col space-y-1">
                                            <div class="px-3 py-2 text-xs font-semibold text-primary-600 uppercase tracking-wider">Community</div>
                                            <a class="flex items-center py-2 px-3 rounded-lg text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors" href="/our-excos">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 me-2 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                                Our Executives
                                            </a>
                                            <a class="flex items-center py-2 px-3 rounded-lg text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors" href="/our-advisors">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 me-2 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"/><circle cx="17" cy="7" r="5"/></svg>
                                                Our Advisers
                                            </a>
                                            <a class="flex items-center py-2 px-3 rounded-lg text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors" href="/alumnae">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 me-2 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/></svg>
                                                Alumnae
                                            </a>
                                        </div>

                                        <div class="flex flex-col space-y-1 mt-3 lg:mt-0">
                                            <div class="px-3 py-2 text-xs font-semibold text-primary-600 uppercase tracking-wider">Resources</div>
                                            <a class="flex items-center py-2 px-3 rounded-lg text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors" href="https://quiz.mssnoau.org">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 me-2 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                                                Quiz
                                            </a>
                                            <a class="flex items-center py-2 px-3 rounded-lg text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors" href="https://library.mssnoau.org">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 me-2 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                                                E-Library
                                            </a>
                                            <a class="flex items-center py-2 px-3 rounded-lg text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors" href="/annual-dues">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 me-2 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                                Annual Dues
                                            </a>
                                        </div>

                                        <div class="flex flex-col space-y-1 mt-3 lg:mt-0">
                                            <div class="px-3 py-2 text-xs font-semibold text-primary-600 uppercase tracking-wider">Account</div>
                                            <a class="flex items-center py-2 px-3 rounded-lg text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors" href="/contact#faqs">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 me-2 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                                                FAQs
                                            </a>
                                            <a class="flex items-center py-2 px-3 rounded-lg text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors" href="/auth/login">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 me-2 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                                                Log In
                                            </a>
                                            <a class="flex items-center py-2 px-3 rounded-lg text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors" href="/auth/signup">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 me-2 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                                                Sign Up
                                            </a>
                                        </div>
                                    </div>
                                    
                                    <!-- Decorative bottom gradient -->
                                    <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500 rounded-b-xl"></div>
                                </div>
                            {/if}
                        </div>

                        <a 
                            class="lg:px-3 lg:py-5 font-medium font-secondary relative text-gray-700 hover:text-primary-700 transition-colors ease-in-out duration-200 flex gap-1.5 items-center {isActive('/contact') ? 'text-primary-700' : ''}" 
                            href="/contact"
                            aria-current={isActive('/contact') ? 'page' : undefined}
                        >
                            <span>Contact Us</span>
                            {#if isActive('/contact')}
                                <div class="absolute bottom-0 left-0 w-full h-1 bg-primary-600 hidden lg:block"></div>
                            {/if}
                        </a>
                        
                        <!-- Mobile View: Special buttons -->
                        <div class="lg:hidden flex flex-col gap-3 mt-5 border-t border-gray-100 pt-5">
                            <a href="/auth/login" class="py-2.5 px-4 inline-flex justify-center items-center gap-2 rounded-xl border border-primary-300 font-medium text-primary-700 shadow-sm align-middle hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-primary-600 transition-all text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                                Log In
                            </a>
                            <a href="/auth/signup" class="py-2.5 px-4 inline-flex justify-center items-center gap-2 rounded-xl border border-transparent font-medium bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                                Sign Up
                            </a>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </nav>
    <!-- Decorative Islamic pattern - bottom border -->
    <div class="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500"></div>
</header>

