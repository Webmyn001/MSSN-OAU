<script>
    import PageHeader from "$lib/components/PageHeader.svelte";
    import {Phone} from "lucide-svelte";
    import copyTextToClipboard from "$lib/utils/copy.js";
    import {toast} from "svelte-sonner";
    import {onMount, tick} from "svelte";
    import {useId} from "bits-ui";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import * as Command from "$lib/components/ui/command/index.js";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import {MetaTags} from "svelte-meta-tags";

    export let data;

    $: sessionSelectorOpen = false;


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



    /**
     * @type {ExcoSession[]}
     */
    let sessions = []

    /**
     * @type {string}
     */
    $: selectedSession = "2024/2025"

    onMount(() => {
        sessions = data.sessions
    })
</script>

<!-- Meta Tags -->
<MetaTags
        title="Our Executives"
        titleTemplate="%s | MSSNOAU"
        description="Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University."
        canonical="https://mssnoau-frontend.vercel.app/our-excos"
        openGraph={{
    url: 'https://mssnoau-frontend.vercel.app/-our-excos',
    title: 'Our Executives | MSSNOAU',
    description: 'Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University.',
    images: [
      {
        url: 'https://i.ibb.co/XkXWPtq/our-excos.webp',
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
    Our Executives
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
                <Command.Input class="outline-none focus:outline-none focus:ring-0 focus:border-transparent" placeholder="Choose Session..."/>
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

<section class="py-24">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        {#if selectedSession && selectedSession.length === 9}
            {#each sessions.find(session => session.session === selectedSession)?.all ?? [] as committee}
                <div class="mb-12">
                    <div class="text-xl text-green-800 font-semibold text-center font-secondary py-3 flex items-center before:flex-1 before:border-t before:border-green-300 before:me-6 after:flex-1 after:border-t after:border-green-300 after:ms-6">
                        {committee.label}
                    </div>

                    <div class="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-14 mt-8">
                        {#each committee.members as member}
                            <AlertDialog.Root>
                                <AlertDialog.Trigger>
                                    <div class="group cursor-pointer text-center">
                                        <div class="relative mb-5">
                                            <img
                                                    src={member.photo}
                                                    alt={member.name}
                                                    class="w-28 h-28 rounded-2xl object-cover mx-auto transition-all duration-500 border-2 border-solid border-transparent group-hover:border-green-600"
                                            />
                                        </div>
                                        <h4 class="text-xl text-gray-900 font-semibold mb-2 transition-all duration-500 group-hover:text-green-600">
                                            {member.name}
                                        </h4>
                                        <span class="text-gray-500 block transition-all duration-500 group-hover:text-gray-900">
                                {member.position}
                            </span>
                                    </div>
                                </AlertDialog.Trigger>
                                <AlertDialog.Content class="lg:max-w-[60dvw] overflow-y-scroll max-h-screen">
                                    <AlertDialog.Header>
                                        <AlertDialog.Title>{member.name}'s Profile</AlertDialog.Title>
                                        <AlertDialog.Description>
                                            Viewing {member.name}, The {member.position} at {committee.label}, MSSNOAU
                                        </AlertDialog.Description>
                                    </AlertDialog.Header>
                                    <!-- Profile -->
                                    <div class="flex items-center gap-x-3">
                                        <div class="shrink-0">
                                            <img class="shrink-0 size-16 rounded-full" src={member.photo}
                                                 alt={member.name}/>
                                        </div>

                                        <div class="grow">
                                            <h1 class="text-lg font-medium text-gray-800">
                                                {member.name}
                                            </h1>
                                            <p class="text-sm text-gray-600 dark:text-neutral-400">
                                                The {member.position} at {committee.label}, MSSNOAU
                                            </p>
                                        </div>
                                    </div>
                                    <!-- End Profile -->

                                    <!-- About -->
                                    <div class="mt-8">

                                        <ul class="mt-5 flex flex-col gap-y-3">
                                            <li class="flex items-center gap-x-2.5">
                                                <Phone class="shrink-0 size-3.5"/>
                                                <a class="text-[13px] text-gray-500 underline hover:text-gray-800 hover:decoration-2 focus:outline-none focus:decoration-2 "
                                                   href={`tel:${member.phone}`}>
                                                    {member.phone}
                                                </a>
                                            </li>

                                            <li class="flex items-center gap-x-2.5">
                                                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                                                     class="shrink-0 size-3.5 text-[#25D366]"><title>WhatsApp</title>
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                </svg>
                                                <a class="text-[13px] text-gray-500 underline hover:text-gray-800 hover:decoration-2 focus:outline-none focus:decoration-2"
                                                   href={`https://wa.me/234${member.phone.replace(/^0/, "").replace(/^234/, "").replace(/^\+234/, "").replaceAll(" ", "")}`}
                                                >
                                                    {member.phone}
                                                </a>
                                            </li>

                                        </ul>
                                    </div>
                                    <!-- End About -->
                                    <AlertDialog.Footer>
                                        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                                        <AlertDialog.Action onclick={() => {
                                        copyTextToClipboard(`${member.name}\nThe ${member.position} at ${committee.label}, MSSNOAU\nPhone: ${member.phone}`)
                                        .then(() => {
                                            toast.success(member.name + "'s details copied to clipboard.");
                                        })
                                        .catch(e => {
                                            toast.error("Failed to copy " + member.name + "'s details to clipboard.")
                                        })
                                    }}>Copy Details
                                        </AlertDialog.Action>
                                    </AlertDialog.Footer>
                                </AlertDialog.Content>
                            </AlertDialog.Root>
                        {/each}
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</section>
