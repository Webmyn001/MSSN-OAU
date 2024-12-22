<div class="relative h-[20dvh] sm:h-[30dvh] lg:h-[40dvh] bg-[url('/images/bg-1.webp')] w-full bg-no-repeat bg-cover bg-center">
    <div class="absolute inset-0 w-full h-full">
        <div
                class="w-full h-full blur-sm"
                style="background: linear-gradient(85.35deg, rgba(0, 128, 1, 0.8) 2.89%, rgba(0, 128, 1, 0.6) 96.95%);">
        </div>
    </div>
    <div class="relative w-full h-full z-[2] flex justify-center items-center">
        <h2 class="font-primary text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold drop-shadow-lg flex justify-center items-center flex-col">
            <slot />
        </h2>
    </div>
</div>