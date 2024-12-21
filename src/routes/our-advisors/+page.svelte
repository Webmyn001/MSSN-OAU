<script>
    import PageHeader from "$lib/components/PageHeader.svelte";
    import {MessageCircle, Phone} from "lucide-svelte";
    import {tick} from "svelte";
    import {useId} from "bits-ui";
    import Ellipsis from "lucide-svelte/icons/ellipsis";
    import {Button} from "$lib/components/ui/button/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import {MetaTags} from "svelte-meta-tags";


    let sessionSelectorOpen = $state(false);


    // We want to refocus the trigger button when the user selects
    // an item from the list so users can continue navigating the
    // rest of the form with the keyboard.
    /**
     *
     * @param {string} triggerId
     */
    function closeAndFocusTrigger(triggerId) {
        sessionSelectorOpen = false;
        tick().then(() => {
            document.getElementById(triggerId)?.focus();
        });
    }

    const triggerId = useId();

    const advisors =  [
        {
            title: "Dr.",
            name: "Surajudeen O. Obayopo",
            position: "Grand Patron",
            email: "someone@oauife.edu.ng",
            phone: "0812345678",
            summary: "Dr. Surajudeen O. is an Associate Professor from the Department of Mechanical Engineering. He has been our patron for the past 3years. He is the current HOD of the Department."
        },
        {
            title: "Dr. Mrs.",
            name: "L. Sanni",
            position: "Grand Patron",
            email: "someone@oauife.edu.ng",
            phone: "0812345678",
            summary: "Dr. Mrs. M. L. Sanni is an Senior Lecturer from the Computer Science & Engineering. She has been our matron for the past 3years. She is the current HOD of the Department."
        },
        {
            title: "Dr.",
            name: "Waheed Bamigbade",
            position: "Grand Patron",
            email: "someone@oauife.edu.ng",
            phone: "0812345678",
            summary: "Dr Waheed Bamigbade is an Senior Lecturer from the English Language. He has been our staff adviser for the past 3years. He is the current HOD of the Department."
        },
        {
            title: "Dr. Mrs.",
            name: "Sururoh Bello",
            position: "Grand Patron",
            email: "someone@oauife.edu.ng",
            phone: "0812345678",
            summary: "Dr. Mrs. Sururoh Bello is an Associate Professor from the Computer Science & Engineering. She has been our staff adviser for the past 3years. She is the current HOD of the Department."
        },
        {
            title: "Mrs.",
            name: "M. I. Nasir",
            position: "Grand Patron",
            email: "someone@oauife.edu.ng",
            phone: "0812345678",
            summary: "Mrs. M. I. Nasir is the Chief System Programmer / Deputy Director OAU Computer Centre. She has been our staff adviser for the past 3years. She is the current head of ICT Centre."
        }
    ]

    /**
     * @type {string}
     */
    let selectedSession = $state("2024/2025")

    let sessions = [
        {
            session: "2024/2025",
            advisors
        }
    ]


</script>

<!-- Meta Tags -->
<MetaTags
        title="Our Advisors"
        titleTemplate="%s | MSSNOAU"
        description="Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University."
        canonical="https://mssnoau-frontend.vercel.app/our-advisors"
        openGraph={{
    url: 'https://mssnoau-frontend.vercel.app/our-advisors',
    title: 'Our Advisors | MSSNOAU',
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
    Our Advisors
    <br/>
    <!-- Session Button -->
    <Popover.Root bind:open={sessionSelectorOpen}>
        <Popover.Trigger
        >
            <div class="flex justify-center mx-auto mt-4">
                <button class="group inline-flex items-center bg-white/10 hover:bg-white/10 border border-white/10 p-1 ps-4 rounded-full shadow-md focus:outline-none focus:bg-white/10"
                >
                    <span class="me-2 text-white text-sm">
                        {selectedSession && selectedSession.length === 9 ? selectedSession : "Choose Session"}
                    </span>
                    <span class="group-hover:bg-white/10 py-1.5 px-2.5 flex justify-center items-center gap-x-2 rounded-full bg-white/10 font-semibold text-white text-sm">
          <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path
                  d="m9 18 6-6-6-6"/></svg>
        </span>
                </button>
            </div>
        </Popover.Trigger>
        <Popover.Content class="w-[300px] p-0" side="bottom" align="start">
            <Command.Root>
                <Command.Input class="outline-none focus:outline-none focus:ring-0 focus:border-transparent"
                               placeholder="Choose Session..."/>
                <Command.List>
                    <Command.Empty>No results found.</Command.Empty>
                    <Command.Group>
                        {#each sessions as session}
                            <Command.Item
                                    value={session.session}
                                    onSelect={() => {
                                        selectedSession = session.session;
                                        closeAndFocusTrigger(triggerId);
                                        }}>
                                <span>{session.session}</span>
                            </Command.Item>
                        {/each}
                    </Command.Group>
                </Command.List>
            </Command.Root>
        </Popover.Content>
    </Popover.Root>
    <!-- Session Button -->
</PageHeader>

<div>

    {#if selectedSession && selectedSession.length === 9}
        {#each sessions.find(session => session.session === selectedSession)?.advisors ?? [] as advisor}
    <!-- Advisor Card -->
    <div class="my-6 mx-[8dvw] px-6 py-8 flex justify-center items-center flex-col gap-8 border rounded-xl shadow-sm">
        <div class="w-full flex justify-between items-start">
            <div class="flex flex-col gap-3">
                <p class="font-secondary font-bold text-primary-800 text-xl sm:text-2xl">{advisor.title} {advisor.name}</p>
                <p class="text-gray-700 font-semibold font-secondary text-lg">{advisor.position}</p>
            </div>

                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        <Button variant="ghost" size="sm" aria-label="Open menu">
                            <Ellipsis class="rotate-90"/>
                        </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                        <DropdownMenu.Group>
                            <DropdownMenu.Item onclick={() => window.open("tel:" + advisor.phone)}>
                                <Phone class="mr-2 size-4"/>
                                Call
                            </DropdownMenu.Item>
                            <DropdownMenu.Item onclick={() => window.open("sms:" + advisor.phone)}>
                                <MessageCircle class="mr-2 size-4"/>
                                Send SMS
                            </DropdownMenu.Item>
                            <DropdownMenu.Item onclick={() => window.open(`https://wa.me/234${advisor.phone.replace(/^0/, "").replace(/^234/, "").replace(/^\+234/, "").replaceAll(" ", "")}`)}>
                                <svg class=
                                             "mr-2 size-4" fill="#25D366" role="img" viewBox="0 0 24 24"
                                     xmlns="http://www.w3.org/2000/svg"><title>WhatsApp</title>
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                Send WhatsApp
                            </DropdownMenu.Item>
                            <DropdownMenu.Item onclick={() => window.open("mailto:" + advisor.email)}>
                                <svg class="mr-2 size-4" width="29" height="22" viewBox="0 0 29 22" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <g clip-path="url(#clip0_751_2241)">
                                        <path d="M6.69114 21.7717V10.6217L3.23317 7.45817L0.132324 5.70264V19.8041C0.132324 20.8928 1.01443 21.7717 2.10001 21.7717H6.69114Z"
                                              fill="#4285F4"/>
                                        <path d="M22.4316 21.7716H27.0228C28.1116 21.7716 28.9905 20.8894 28.9905 19.8039V5.70264L25.4783 7.71339L22.4316 10.6216V21.7716Z"
                                              fill="#34A853"/>
                                        <path d="M6.69124 10.6211L6.2207 6.26447L6.69124 2.09473L14.5618 7.99768L22.4323 2.09473L22.9586 6.03935L22.4323 10.6211L14.5618 16.5241L6.69124 10.6211Z"
                                              fill="#EA4335"/>
                                        <path d="M22.4316 2.09476V10.6212L28.9905 5.7021V3.07855C28.9905 0.645288 26.2128 -0.741847 24.2682 0.717434L22.4316 2.09476Z"
                                              fill="#FBBC04"/>
                                        <path d="M0.132324 5.70215L3.14885 7.96462L6.69114 10.6212V2.09481L4.85455 0.717486C2.90659 -0.741907 0.132324 0.645339 0.132324 3.07849V5.70215Z"
                                              fill="#C5221F"/>
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_751_2241">
                                            <rect width="28.8587" height="21.7568" fill="white"
                                                  transform="translate(0.132324 0.121582)"/>
                                        </clipPath>
                                    </defs>
                                </svg>
                                Send Email
                            </DropdownMenu.Item>
                        </DropdownMenu.Group>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
        </div>

        <p class="font-tertiary tracking-wide">{advisor.summary}
        </p>
    </div>
    <!-- End Advisor Card-->
            {/each}
        {/if}
</div>