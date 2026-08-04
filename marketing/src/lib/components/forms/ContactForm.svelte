<script>
    import { Button } from "$lib/components/ui/button";
    import { Loader2 } from "@lucide/svelte";
    import { API_BASE } from "$lib/api/base";
    
  
    let { wrapperClass = "max-w-lg mx-auto", title = "Contact Form", submitLabel = "Submit Message", subtitle = "We'll try to get back to you as soon as possible Insha'Allah." } = $props();
    
    const API_URL = `${API_BASE}/public/contact`;

    // Form state
    let isSubmitting = $state(false);
    let isSubmitted = $state(false);
    let formError = $state(null);
    
    // Form data
    let formData = $state({
        fname: "",
        lname: "",
        email: "",
        phone: "",
        message: ""
    });
    
    // Basic validation state
    let touched = $state({
        fname: false,
        lname: false,
        phone: false,
        message: false
    });
    
    function handleInput(field) {
        touched[field] = true;
    }
    
    function getFieldState(field) {
        if (!touched[field]) return "";
        
        if (field === 'fname' || field === 'lname') {
            return formData[field].trim().length > 0 ? "valid" : "invalid";
        }
        
        if (field === 'phone') {
            return formData.phone.trim().length > 8 ? "valid" : "invalid";
        }
        
        if (field === 'message') {
            return formData.message.trim().length > 10 ? "valid" : "invalid";
        }
        
        return "";
    }
    
    async function handleSubmit(event) {
        event.preventDefault();
        // Set all fields as touched for validation
        Object.keys(touched).forEach(key => touched[key] = true);
        
        // Check if all required fields are valid
        const isValid = 
            formData.fname.trim().length > 0 && 
            formData.lname.trim().length > 0 && 
            formData.phone.trim().length > 8 && 
            formData.message.trim().length > 10;
            
        if (!isValid) {
            formError = "Please fill in all required fields correctly.";
            return;
        }
        
        // Set loading state
        isSubmitting = true;
        formError = null;

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err?.message || 'Failed to send message');
            }

            isSubmitted = true;

            // Reset form
            formData = {
                fname: "",
                lname: "",
                email: "",
                phone: "",
                message: ""
            };
            Object.keys(touched).forEach(key => touched[key] = false);
        } catch (err) {
            formError = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
        } finally {
            isSubmitting = false;
        }
    }
</script>

<div class={wrapperClass}>
    <!-- Card -->
    <div id="form" class="flex flex-col border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-8 shadow-md bg-white/80 backdrop-blur-sm">
        <h2 class="mb-2 text-xl font-semibold font-secondary text-primary-700">
            {title}
        </h2>
        
        <p class="mb-6 text-sm text-gray-600">{subtitle}</p>

        {#if isSubmitted}
            <div class="text-center py-8 px-4">
                <div class="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Thank You!</h3>
                <p class="text-gray-600 mb-6">Your message has been sent successfully. We'll get back to you soon.</p>
                <Button variant="outline" onclick={() => isSubmitted = false}>Send Another Message</Button>
            </div>
        {:else}
            <form onsubmit={handleSubmit}>
                <div class="grid gap-4 lg:gap-6">
                    <!-- Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                        <div>
                            <label for="fname" class="block mb-2 text-sm text-gray-700 font-medium font-primary">
                                First Name <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <input 
                                    type="text" 
                                    required 
                                    autocomplete="given-name" 
                                    name="fname" 
                                    id="fname" 
                                    class="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-primary-600 focus:ring-primary-600 disabled:opacity-50 disabled:pointer-events-none shadow-sm {getFieldState('fname') === 'invalid' ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} {getFieldState('fname') === 'valid' ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : ''}"
                                    bind:value={formData.fname}
                                    onblur={() => handleInput('fname')}
                                />
                                {#if getFieldState('fname') === 'invalid'}
                                    <div class="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-3">
                                        <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                {/if}
                            </div>
                            {#if getFieldState('fname') === 'invalid'}
                                <p class="mt-1 text-xs text-red-600">Please enter your first name</p>
                            {/if}
                        </div>

                        <div>
                            <label for="lname" class="block mb-2 text-sm text-gray-700 font-medium font-primary">
                                Last Name <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <input 
                                    type="text" 
                                    required 
                                    autocomplete="family-name" 
                                    name="lname" 
                                    id="lname" 
                                    class="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-primary-600 focus:ring-primary-600 disabled:opacity-50 disabled:pointer-events-none shadow-sm {getFieldState('lname') === 'invalid' ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} {getFieldState('lname') === 'valid' ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : ''}"
                                    bind:value={formData.lname}
                                    onblur={() => handleInput('lname')}
                                />
                                {#if getFieldState('lname') === 'invalid'}
                                    <div class="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-3">
                                        <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                {/if}
                            </div>
                            {#if getFieldState('lname') === 'invalid'}
                                <p class="mt-1 text-xs text-red-600">Please enter your last name</p>
                            {/if}
                        </div>
                    </div>
                    <!-- End Grid -->

                    <!-- Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                        <div>
                            <label for="email" class="block mb-2 text-sm text-gray-700 font-medium font-primary">Email [optional]</label>
                            <input 
                                type="email" 
                                name="email" 
                                id="email" 
                                autocomplete="email" 
                                class="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-primary-600 focus:ring-primary-600 disabled:opacity-50 disabled:pointer-events-none shadow-sm"
                                bind:value={formData.email}
                            />
                        </div>

                        <div>
                            <label for="phone" class="block mb-2 text-sm text-gray-700 font-medium font-primary">
                                Phone Number <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <input 
                                    type="tel" 
                                    required 
                                    autocomplete="mobile tel" 
                                    name="phone" 
                                    id="phone" 
                                    class="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-primary-600 focus:ring-primary-600 disabled:opacity-50 disabled:pointer-events-none shadow-sm {getFieldState('phone') === 'invalid' ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} {getFieldState('phone') === 'valid' ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : ''}"
                                    bind:value={formData.phone}
                                    onblur={() => handleInput('phone')}
                                />
                                {#if getFieldState('phone') === 'invalid'}
                                    <div class="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-3">
                                        <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                {/if}
                            </div>
                            {#if getFieldState('phone') === 'invalid'}
                                <p class="mt-1 text-xs text-red-600">Please enter a valid phone number</p>
                            {/if}
                        </div>
                    </div>
                    <!-- End Grid -->

                    <div>
                        <label for="message" class="block mb-2 text-sm text-gray-700 font-medium font-primary">
                            Message <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                            <textarea 
                                id="message" 
                                required 
                                name="message" 
                                rows="5" 
                                class="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-primary-600 focus:ring-primary-600 disabled:opacity-50 disabled:pointer-events-none shadow-sm {getFieldState('message') === 'invalid' ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} {getFieldState('message') === 'valid' ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : ''}"
                                bind:value={formData.message}
                                onblur={() => handleInput('message')}
                            ></textarea>
                            {#if getFieldState('message') === 'invalid'}
                                <div class="absolute top-3 right-3 pointer-events-none">
                                    <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                            {/if}
                        </div>
                        {#if getFieldState('message') === 'invalid'}
                            <p class="mt-1 text-xs text-red-600">Please enter a message (at least 10 characters)</p>
                        {/if}
                    </div>
                </div>
                <!-- End Grid -->

                {#if formError}
                    <div class="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        <div class="flex items-center gap-2">
                            <svg class="h-5 w-5 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                            <p>{formError}</p>
                        </div>
                    </div>
                {/if}

                <div class="mt-6">
                    <Button 
                        type="submit" 
                        class="w-full"
                        disabled={isSubmitting}
                    >
                        {#if isSubmitting}
                            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                        {:else}
                            {submitLabel}
                        {/if}
                    </Button>
                </div>
            </form>
        {/if}
    </div>
    <!-- End Card -->
</div> 