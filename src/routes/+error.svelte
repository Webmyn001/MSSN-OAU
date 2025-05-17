<script>
    import { page } from '$app/stores';
    import { Image } from '$lib/components/ui/image';
    
    let { data } = $props();
    
    let statusCode = $page.status;
    let message = $state($page.error?.message || 'Something went wrong');
    
    // Handle common status codes with more friendly messages
    const statusMessages = {
        404: "The page you're looking for doesn't exist",
        500: "Our servers encountered an error",
        403: "You don't have permission to access this resource",
        401: "Authentication is required to access this page",
    };
    
    // Override with friendly message if available
    if (statusMessages[statusCode]) {
        message = statusMessages[statusCode];
    }
</script>

<svelte:head>
    <title>{statusCode} Error | MSSNOAU</title>
</svelte:head>

<section id="paper" class="py-24 relative w-full min-h-[80vh] mx-auto flex justify-center items-center">
    <div class="absolute top-0 left-0 w-full h-full bg-primary-900/5 pointer-events-none"></div>
    <div class="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern.svg')] opacity-[0.04] pointer-events-none"></div>
    
    <div class="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto text-center relative z-10">
        <div class="w-full flex-col justify-center items-center lg:gap-14 gap-10 inline-flex">
            <a href="/" class="mx-auto">
                <Image 
                    src="/mssn-logo.png" 
                    alt="MSSNOAU logo" 
                    className="h-24 mx-auto"
                    height={96} 
                />
            </a>
            
            <div class="w-full flex-col justify-center items-center gap-5 flex">
                <div class="w-full flex-col justify-center items-center gap-6 flex">
                    <div class="w-full flex-col justify-center items-center gap-2.5 flex">
                        <div class="text-center text-9xl font-bold text-primary-700/10">{statusCode}</div>
                        
                        <h2 class="text-center text-3xl md:text-4xl lg:5xl font-bold font-primary leading-normal text-primary-900 scheherazade-new-semibold mx-auto mb-4">
                            فَاصْبِرْ إِنَّ وَعْدَ اللَّهِ حَقٌّ
                        </h2>
                        
                        <p class="text-center text-primary-800 text-base font-medium italic leading-relaxed mx-auto mb-4">
                            "So be patient. Indeed, the promise of Allah is truth."
                            <span class="block text-sm text-gray-600 mt-1 not-italic">— Surah Ar-Rum (30:60)</span>
                        </p>
                        
                        <h3 class="text-xl md:text-2xl font-semibold text-gray-800 mt-4">{message}</h3>
                        <p class="text-center text-gray-500 text-base font-normal leading-relaxed mx-auto mt-2">
                            We apologize for the inconvenience. You may go back to the homepage.
                        </p>
                    </div>
                </div>
                
                <div class="mt-8 relative">
                    <div class="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-700/10 rounded-xl blur-lg transform -rotate-1"></div>
                    <a 
                        href="/"
                        class="relative inline-flex items-center justify-center px-6 py-3 font-medium text-white bg-primary-700 rounded-xl hover:bg-primary-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                    >
                        Return to Homepage
                    </a>
                </div>
                
                <!-- Islamic geometric pattern decoration -->
                <div class="mt-16 opacity-30">
                    <svg width="200" height="60" viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="mx-auto">
                        <path d="M400 0L480 138.564H320L400 0Z" fill="#026D3B"/>
                        <path d="M320 138.564L240 0L160 138.564H320Z" fill="#026D3B"/>
                        <path d="M480 138.564L560 0L640 138.564H480Z" fill="#026D3B"/>
                        <path d="M160 138.564L80 0L0 138.564H160Z" fill="#026D3B"/>
                        <path d="M640 138.564L720 0L800 138.564H640Z" fill="#026D3B"/>
                        <path d="M400 240L320 101.436H480L400 240Z" fill="#026D3B"/>
                        <path d="M320 101.436L160 101.436L240 240L320 101.436Z" fill="#026D3B"/>
                        <path d="M480 101.436L640 101.436L560 240L480 101.436Z" fill="#026D3B"/>
                        <path d="M160 101.436L0 101.436L80 240L160 101.436Z" fill="#026D3B"/>
                        <path d="M640 101.436L800 101.436L720 240L640 101.436Z" fill="#026D3B"/>
                    </svg>
                </div>
            </div>
        </div>
    </div>
</section>

<svg>
    <filter id="wavy-error">
        <feTurbulence x="0" y="0" baseFrequency="0.0015" numOctaves="1" seed="2"></feTurbulence>
        <feDisplacementMap in="SourceGraphic" scale="20" />
    </filter>
</svg>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@600&display=swap');

    .scheherazade-new-semibold {
        font-family: "Scheherazade New", serif;
        font-weight: 600;
        font-style: normal;
    }

    #paper {
        position: relative;
        display: flex;
        width: 100%;
        min-height: calc((1vw + 1vh) * 50);
        margin: 0 auto;
        padding: 4em 2em;
        box-shadow: 2px 3px 20px rgba(0, 0, 0, 0.3), 0 0 60px rgba(13, 94, 53, 0.1) inset;
        background: #fffef5;
        filter: url(#wavy-error);
    }
    
    /* Add subtle animation to the page number */
    @keyframes pulse {
        0%, 100% { opacity: 0.1; }
        50% { opacity: 0.2; }
    }
    
    .text-primary-700\/10 {
        animation: pulse 4s ease-in-out infinite;
    }
</style> 