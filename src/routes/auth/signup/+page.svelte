<script>
    import { fly } from 'svelte/transition';
    // import { onMount } from 'svelte'; // No longer needed for isMobile
    import { Button, buttonVariants } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    // import ResponsiveModal from "$lib/components/layout/ResponsiveModal.svelte"; // Removed static import
    import { AlertCircle, Loader2, Check, X, Eye, EyeOff, UserPlus, MailCheck, Info } from '@lucide/svelte';
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import SEO from '$lib/components/SEO.svelte';
    // import * as Form from '$lib/components/ui/form'; // Not directly used, can be removed if no Form.Field etc.
    import { browser } from '$app/environment';
    import { toast } from 'svelte-sonner';
    
    /** @type {import('./$types').PageData} */
    let { data } = $props(); // Assuming PageData will be defined in $types.d.ts or similar by SvelteKit
    
    // State management
    /** @type {string} */
    let firstName = $state("");
    /** @type {string} */
    let lastName = $state("");
    /** @type {string} */
    let matricNo = $state("");
    /** @type {string} */
    let referenceNo = $state("");
    /** @type {string} */
    let email = $state("");
    /** @type {string} */
    let password = $state("");
    /** @type {string} */
    let confirmPassword = $state("");
    /** @type {boolean} */
    let showPassword = $state(false);
    /** @type {boolean} */
    let showConfirmPassword = $state(false);
    /** @type {boolean} */
    let isLoading = $state(false);
    /** @type {string | null} */
    let signupError = $state(null);
    /** @type {boolean} */
    let showOtpScreen = $state(false);
    /** @type {boolean} */
    let showModal = $state(false); // Binds to ResponsiveModal
    /** @type {string[]} */
    let otpValues = $state(["", "", "", "", "", ""]);
    /** @type {string | null} */
    let otpError = $state(null);
    /** @type {boolean} */
    let isOtpLoading = $state(false);
    /** @type {boolean} */
    let otpResent = $state(false);
    /** @type {boolean} */
    let signupSuccess = $state(false);
    
    /** @type {boolean} */
    let isFirstNameValid = $derived(firstName.length > 1);
    /** @type {boolean} */
    let isLastNameValid = $derived(lastName.length > 1);
    /** @type {boolean} */
    let isMatricValid = $derived(/^[A-Z]{3}\/\d{4}\/\d{3}$/i.test(matricNo));
    /** @type {boolean} */
    let isReferenceValid = $derived(/^\d{12}[A-Z]{2}$/i.test(referenceNo));
    /** @type {boolean} */
    let isEmailValid = $derived(email.includes('@') && email.includes('.'));
    /** @type {boolean} */
    let isPasswordValid = $derived(password.length >= 8);
    /** @type {boolean} */
    let doPasswordsMatch = $derived(password === confirmPassword && confirmPassword.length > 0);
    /** @type {boolean} */
    const isFormValid = $derived(
        isFirstNameValid && isLastNameValid && 
        (matricNo ? isMatricValid : true) && 
        (referenceNo ? isReferenceValid : true) && 
        (isMatricValid || isReferenceValid) && 
        isEmailValid && isPasswordValid && doPasswordsMatch
    );
    /** @type {boolean} */
    const isOtpComplete = $derived(otpValues.every(v => v !== ""));
    
    /** @param {SubmitEvent} e */
    function handleSignup(e) {
        e.preventDefault();
        if (!isFormValid) return;
        isLoading = true;
        signupError = null;
        signupSuccess = false;
        showOtpScreen = false;
        setTimeout(() => {
            isLoading = false;
            if (email === "error@example.com") {
                signupError = "This email is already associated with an account.";
                showModal = true; return;
            }
            // Add other validation checks as before...
            showOtpScreen = true;
            showModal = true;
        }, 1500);
    }
    
    /**
     * @param {number} index
     * @param {Event & {currentTarget: HTMLInputElement, target: HTMLInputElement}} event
     */
    function handleOtpInputChange(index, event) {
        const target = event.target;
        const value = target.value;
        if (!/^\d*$/.test(value)) {
            target.value = otpValues[index]; return;
        }
        otpValues[index] = value.charAt(0);
        if (value && index < otpValues.length - 1) {
            if (browser) {
                const nextInput = /** @type {HTMLInputElement | null} */ (document.getElementById(`otp-${index + 1}`));
            if (nextInput) nextInput.focus();
            }
        }
        otpValues = [...otpValues];
    }
    
    /**
     * @param {number} index
     * @param {KeyboardEvent & {currentTarget: HTMLInputElement, target: HTMLInputElement}} event
     */
    function handleOtpKeyDown(index, event) {
        if (event.key === 'Backspace' && !otpValues[index] && index > 0) {
            if (browser) {
                const prevInput = /** @type {HTMLInputElement | null} */ (document.getElementById(`otp-${index - 1}`));
            if (prevInput) prevInput.focus();
            }
        }
    }
    
    function verifyOtp() {
        if (!isOtpComplete) return;
        isOtpLoading = true;
        otpError = null;
        setTimeout(() => {
            isOtpLoading = false;
            if (otpValues.join('') === '123456') {
                signupSuccess = true;
                showOtpScreen = false;
                setTimeout(() => {
                    if (browser) window.location.href = '/auth/login'; 
                }, 2000);
            } else {
                otpError = "Invalid OTP. Please try again or resend.";
            }
        }, 1500);
    }
    
    /** 
     * @param {string} value 
     * @returns {string} 
     */
    function formatMatricNo(value) {
        let cleaned = value.replace(/[^A-Za-z0-9\/]/g, '').toUpperCase();
        let parts = cleaned.split('/');
        if (parts.length > 0) cleaned = parts[0].substring(0, 3);
        if (parts.length > 1) cleaned += '/' + parts[1].substring(0, 4);
        if (parts.length > 2) cleaned += '/' + parts[2].substring(0, 3);
            return cleaned;
    }
    
    /** @param {Event & {target: HTMLInputElement}} event */
    function handleMatricInput(event) {
        const target = event.target;
        matricNo = formatMatricNo(target.value);
    }
    
    /** 
     * @param {string} value 
     * @returns {string} 
     */
    function formatReferenceNo(value) {
        let cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        return cleaned.substring(0, 14); 
    }

    /** @param {Event & {target: HTMLInputElement}} event */
    function handleReferenceInput(event) {
        const target = event.target;
        referenceNo = formatReferenceNo(target.value);
    }
    
    function resendOtp() {
        isOtpLoading = true;
        otpError = null;
        setTimeout(() => {
        isOtpLoading = false;
            otpResent = true;
            toast.success("A new OTP has been sent to your email address.");
            setTimeout(() => otpResent = false, 5000);
        }, 1000);
    }
    
    function closeModalAndReset() {
        showModal = false;
        setTimeout(() => {
            signupError = null;
            showOtpScreen = false;
            otpValues = ["", "", "", "", "", ""];
            otpError = null;
            signupSuccess = false;
        }, 300); 
    }
    function togglePasswordVisibility() { showPassword = !showPassword; }
    function toggleConfirmPasswordVisibility() { showConfirmPassword = !showConfirmPassword; }

    /** @type {string} */
    const modalTitle = $derived(
        signupSuccess ? "Account Created!" :
        showOtpScreen ? "Verify Your Email" :
        signupError ? "Signup Failed" :
        ""
    );

    /** @type {string} */
    const modalDescription = $derived(
        signupSuccess ? "Redirecting to login..." :
        showOtpScreen ? "A 6-digit code has been sent. Check your inbox & spam folder." :
        signupError ? signupError :
        ""
    );

</script>

<SEO
    title="Create Account"
    description="Create an MSSNOAU account to connect with the community, access resources, and stay updated on events."
    path="/auth/signup"
    type="WebPage" 
    images={[
        {
            url: 'https://mssnoau.sirv.com/og/og-signup.jpg',
                width: 1200,
            height: 630,
            alt: 'MSSNOAU Signup Page'
        }
    ]}
    schema={{
        "@context": "https://schema.org",
    "@type": "WebPage",
        "name": "Create Account | MSSNOAU",
        "description": "Sign up for an account with the Muslim Students Society of Nigeria, OAU Branch.",
    "publisher": {
        "@type": "Organization",
            "name": "MSSNOAU"
    }
}}
    keywords={["create account mssnoau", "mssnoau signup", "join mssnoau", "muslim students oau account"]}
/>

<PageHeader>Create Account</PageHeader>

<div class="max-w-2xl mx-auto px-4 py-8 sm:py-12" in:fly={{ y: 20, duration: 500, delay: 200 }}>
    <div class="text-center mb-8">
        <h1 class="text-2xl sm:text-3xl font-semibold font-secondary text-primary-800">Join Our Community</h1>
        <p class="text-gray-600 mt-1">Fill in the details below to create your MSSNOAU account.</p>
    </div>
    <form onsubmit={handleSignup} class="space-y-5 bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-gray-200">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div>
                <Label for="firstName" class="">First Name</Label>
                <Input id="firstName" type="text" bind:value={firstName} required aria-invalid={firstName && !isFirstNameValid ? true : undefined} placeholder="e.g. Abdullahi" class=""/>
                {#if firstName && !isFirstNameValid}<p class="text-red-600 text-xs mt-1 flex items-center"><AlertCircle class="w-3 h-3 mr-1"/>First name is too short.</p>{/if}
            </div>
            <div>
                <Label for="lastName" class="">Last Name</Label>
                <Input id="lastName" type="text" bind:value={lastName} required aria-invalid={lastName && !isLastNameValid ? true : undefined} placeholder="e.g. Bello" class=""/>
                {#if lastName && !isLastNameValid}<p class="text-red-600 text-xs mt-1 flex items-center"><AlertCircle class="w-3 h-3 mr-1"/>Last name is too short.</p>{/if}
            </div>
        </div>
            <div>
            <Label for="email" class="">Email Address</Label>
            <Input id="email" type="email" bind:value={email} required aria-invalid={email && !isEmailValid ? true : undefined} placeholder="you@example.com" class=""/>
            {#if email && !isEmailValid}<p class="text-red-600 text-xs mt-1 flex items-center"><AlertCircle class="w-3 h-3 mr-1"/>Please enter a valid email.</p>{/if}
            </div>
            <div>
            <Label for="matricNo" class="">Matric No. <span class="text-xs text-gray-500">(Format: ABC/2020/123)</span></Label>
            <Input id="matricNo" type="text" bind:value={matricNo} oninput={handleMatricInput} aria-invalid={matricNo && !isMatricValid ? true : undefined} placeholder="Leave blank if not applicable" class=""/>
            {#if matricNo && !isMatricValid}<p class="text-red-600 text-xs mt-1 flex items-center"><AlertCircle class="w-3 h-3 mr-1"/>Invalid Matric No. format.</p>{/if}
        </div>
        <div>
            <Label for="referenceNo" class="">Reference No. <span class="text-xs text-gray-500">(Postgraduate/Alumni)</span></Label>
            <Input id="referenceNo" type="text" bind:value={referenceNo} oninput={handleReferenceInput} aria-invalid={referenceNo && !isReferenceValid ? true : undefined} placeholder="Leave blank if not applicable" class=""/>
            {#if referenceNo && !isReferenceValid}<p class="text-red-600 text-xs mt-1 flex items-center"><AlertCircle class="w-3 h-3 mr-1"/>Invalid Reference No. format.</p>{/if}
        </div>
        {#if !matricNo && !referenceNo}
             <p class="text-orange-600 text-xs -mt-3 flex items-center"><Info class="w-3 h-3 mr-1 shrink-0" /> Please provide either a Matriculation Number or a Reference Number.</p>
                {/if}
                <div class="relative">
            <Label for="password" class="">Password</Label>
            <Input id="password" type={showPassword ? 'text' : 'password'} bind:value={password} required aria-invalid={password && !isPasswordValid ? true : undefined} placeholder="Min. 8 characters" class=""/>
            <Button type="button" variant="ghost" size="icon" onclick={togglePasswordVisibility} class="absolute right-1 top-6 h-7 w-7 text-gray-500 hover:text-gray-700">
                {#if showPassword}<EyeOff class="h-4 w-4" />{:else}<Eye class="h-4 w-4" />{/if}
            </Button>
            {#if password && !isPasswordValid}<p class="text-red-600 text-xs mt-1 flex items-center"><AlertCircle class="w-3 h-3 mr-1"/>Password must be at least 8 characters.</p>{/if}
        </div>
        <div class="relative">
            <Label for="confirmPassword" class="">Confirm Password</Label>
            <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} bind:value={confirmPassword} required aria-invalid={confirmPassword && !doPasswordsMatch ? true : undefined} placeholder="Re-enter your password" class=""/>
            <Button type="button" variant="ghost" size="icon" onclick={toggleConfirmPasswordVisibility} class="absolute right-1 top-6 h-7 w-7 text-gray-500 hover:text-gray-700">
                {#if showConfirmPassword}<EyeOff class="h-4 w-4" />{:else}<Eye class="h-4 w-4" />{/if}
            </Button>
            {#if confirmPassword && !doPasswordsMatch && isPasswordValid}<p class="text-red-600 text-xs mt-1 flex items-center"><AlertCircle class="w-3 h-3 mr-1"/>Passwords do not match.</p>{/if}
        </div>
        <Button type="submit" disabled={!isFormValid || isLoading} class="w-full text-base py-3">
            {#if isLoading}<Loader2 class="mr-2 h-5 w-5 animate-spin" />{:else}<UserPlus class="mr-2 h-5 w-5" />Create Account{/if}
        </Button>
        <p class="text-sm text-center text-gray-600">
                Already have an account?
            <a href="/auth/login" class="font-medium text-primary-600 hover:text-primary-700 hover:underline">Log in here</a>
            </p>
    </form>
</div>

{#if showModal}
    {#await import('$lib/components/layout/ResponsiveModal.svelte') then module}
        {@const ResponsiveModal = module.default}
        <ResponsiveModal 
            bind:open={showModal} 
            title={modalTitle}
            description={modalDescription}
            onOpenChange={(isOpen) => { if (!isOpen) closeModalAndReset(); }}
            contentClass={showOtpScreen ? "sm:max-w-lg" : "sm:max-w-sm"} 
            closeOnOutsideClick={!isOtpLoading && !signupSuccess} 
            closeOnEscape={!isOtpLoading && !signupSuccess}
        >
            {#if signupSuccess}
                <div class="text-center py-6">
                    <MailCheck class="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p class="text-gray-700">Your account has been created successfully.</p>
                </div>
            {:else if showOtpScreen}
                <div class="space-y-4 pt-2">
                    <div class="grid grid-cols-6 gap-2 sm:gap-3">
                        {#each otpValues as value, i (i)}
                            <Input
                                type="text"
                                maxlength="1" 
                                id={`otp-${i}`}
                                bind:value={otpValues[i]} 
                                oninput={(e) => handleOtpInputChange(i, e)} 
                                onkeydown={(e) => handleOtpKeyDown(i, e)}
                                class="text-center text-lg sm:text-xl h-12 sm:h-14 focus:ring-2 focus:ring-primary-500 transition-all duration-200 ease-in-out"
                                aria-label={`OTP digit ${i + 1}`}
                                autocomplete="one-time-code"
                                pattern="[0-9]*"
                                inputmode="numeric"
                                disabled={isOtpLoading}
                            />
                            {/each}
                    </div>
                    {#if otpError}
                        <p class="text-red-600 text-sm flex items-center">
                            <AlertCircle class="w-4 h-4 mr-1.5 shrink-0" />
                            {otpError}
                        </p>
                        {/if}
                    <p class="text-xs text-gray-500 text-center">
                        Didn't receive the code? 
                        <button 
                            onclick={resendOtp} 
                            disabled={isOtpLoading || otpResent}
                            class="font-medium text-primary-600 hover:text-primary-700 underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                        >
                            {#if isOtpLoading && !otpResent}Resending...{:else if otpResent}Code Sent!{:else}Resend Code{/if}
                        </button>
                    </p>
                    </div>
            {:else if signupError} <!-- This is the case for signupError and not success and not OTP -->
                <div class="text-center py-4">
                    <AlertCircle class="h-12 w-12 text-red-500 mx-auto mb-3" />
                    <p class="text-gray-600">{signupError}</p>
                </div>
            {/if}

            <!-- Consolidated Footer Snippet -->
            {#snippet footer()}
                {#if signupSuccess}
                    <Button onclick={() => { if (browser) window.location.href='/auth/login';}} class="w-full">Proceed to Login</Button>
                {:else if showOtpScreen}
                    <Button variant="outline" onclick={closeModalAndReset} disabled={isOtpLoading} class="w-full sm:w-auto">Cancel</Button>
                    <Button onclick={verifyOtp} disabled={!isOtpComplete || isOtpLoading} class="w-full sm:w-auto">
                        {#if isOtpLoading}<Loader2 class="mr-2 h-4 w-4 animate-spin" />{:else}Verify Email{/if}
                        </Button>
                {:else if signupError}
                    <Button onclick={closeModalAndReset} class="w-full">Close</Button>
                {/if}
            {/snippet}
        </ResponsiveModal>
    {/await}
{/if}
