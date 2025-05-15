<script>
    import { format } from 'timeago.js';
    export let time = new Date().setHours(new Date().getHours() + 1);


</script>
<svelte:head>
    <title>Under Maintenance  | MSSNOAU</title>
</svelte:head>
<section id="paper" class="py-24 relative w-full h-full mx-auto flex justify-center items-center">
    <div class="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto text-center">
        <div class="w-full flex-col justify-center items-center lg:gap-14 gap-10 inline-flex">
            <a href="/" class="mx-auto">
                <img src="/mssn-logo.png" alt="mssnoau logo" class="h-24 mx-auto" />
            </a>
            <div class="w-full flex-col justify-center items-center gap-5 flex">
                <div class="w-full flex-col justify-center items-center gap-6 flex">
                    <div class="w-full flex-col justify-center items-center gap-2.5 flex">
                        <h2 class="text-center text-3xl md:text-4xl lg:5xl font-bold font-primary leading-normal text-primary-900 scheherazade-new-semibold mx-auto">وَاللَّهُ مَعَ الصَّابِرِينَ</h2>
                        <p class="text-center text-gray-500 text-base font-normal leading-relaxed mx-auto">Our website is currently undergoing maintenance.
                            <br />
                            Please bear with us while we're patching things up. We should be done {format(time)}</p>
                    </div>
                </div>
                <img src="https://mssnoau.sirv.com/images/under-maintenance.png" alt="Under Maintenance" class="object-cover mx-auto">
                <div class="w-full flex-col justify-center items-center gap-6 flex">
                    <div class="w-full flex-col justify-center items-center gap-2.5 flex">
                        <p class="text-center text-gray-500 text-base font-normal leading-relaxed mx-auto">It's going to take some time to fix the error. We'll be back online in.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
<svg>
    <filter id="wavy2">
        <feTurbulence x="0" y="0" baseFrequency="0.002" numOctaves="1" seed="1"></feTurbulence>
        <feDisplacementMap in="SourceGraphic" scale="30" />
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
        position: absolute;
        display: flex;
        width: 80%;
        min-height: calc((1vw + 1vh) * 75);
        /* center page with absolute position */
        top: 0%; left: 50%; transform: translate(-50%, 0);
        margin: 2em auto;
        padding: 4em;
        box-shadow: 2px 3px 20px black, 0 0 60px #8a4d0f inset;
        background: #fffef0;
        filter: url(#wavy2);
    }
</style> 