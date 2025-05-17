<script>
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { Button, buttonVariants } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { AlertCircle, Loader2, Check, X, ShieldCheck, MailWarning, Info } from '@lucide/svelte';
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import SEO from '$lib/components/SEO.svelte';
    import * as Form from '$lib/components/ui/form';
    import { browser } from '$app/environment';
    import { toast } from 'svelte-sonner';
    
    // State management
    /** @type {string} */
    let email = $state("");
    /** @type {string} */
    let password = $state("");
    /** @type {boolean} */
    let isLoading = $state(false);
    /** @type {string | null} */
    let loginError = $state(null);
    /** @type {boolean} */
    let showOtpScreen = $state(false);
    /** @type {boolean} */
    let showModal = $state(false);
    /** @type {string[]} */
    let otpValues = $state(["", "", "", "", "", ""]);
    /** @type {string | null} */
    let otpError = $state(null);
    /** @type {boolean} */
    let isOtpLoading = $state(false);
    /** @type {boolean} */
    let otpResent = $state(false);
    /** @type {boolean} */
    let loginSuccess = $state(false);
    /** @type {boolean} */
    let connectionError = $state(false); 
    
    // Derived state for validation
    /** @type {boolean} */
    const isEmailValid = $derived(email.includes('@') && email.includes('.'));
    /** @type {boolean} */
    const isPasswordValid = $derived(password.length >= 8);
    /** @type {boolean} */
    const isFormValid = $derived(isEmailValid && isPasswordValid);
    /** @type {boolean} */
    const isOtpComplete = $derived(otpValues.every(v => v !== ""));
    
    /** @param {SubmitEvent} e */
    function handleLogin(e) {
        e.preventDefault();
        if (!isFormValid) return;
        isLoading = true;
        loginError = null;
        connectionError = false;
        loginSuccess = false;
        showOtpScreen = false;
        
        setTimeout(() => {
            isLoading = false;
            if (email === "test@example.com" && password === "password123") {
                showOtpScreen = true;
                showModal = true; 
            } else if (email === "error@example.com") {
                loginError = "This account has been suspended.";
                showModal = true;
            } else if (email === "connection@error.com") {
                connectionError = true;
                loginError = "Network error. Please check your connection.";
                showModal = true;
            } else {
                loginError = "Invalid email or password. Please try again.";
                showModal = true;
            }
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
            target.value = otpValues[index]; // Restore old value if not a digit
            return;
        }
        otpValues[index] = value.charAt(0); // Take only the first character
        if (value && index < otpValues.length - 1) {
            if (browser) {
                const nextInput = /** @type {HTMLInputElement | null} */ (document.getElementById(`otp-${index + 1}`));
                if (nextInput) nextInput.focus();
            }
        }
        otpValues = [...otpValues]; // Trigger reactivity for array mutation
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
                loginSuccess = true;
                showOtpScreen = false; 
                setTimeout(() => {
                    if (browser) window.location.href = '/'; 
                }, 2000);
            } else {
                otpError = "Invalid OTP. Please try again or resend.";
            }
        }, 1500);
    }
    
    function resendOtp() {
        isOtpLoading = true; 
        otpError = null;
        setTimeout(() => {
            isOtpLoading = false;
            otpResent = true;
            toast.success("A new OTP has been sent to your email.");
            setTimeout(() => otpResent = false, 5000);
        }, 1000);
    }
    
    function closeModalAndReset() {
        showModal = false;
        setTimeout(() => {
            loginError = null;
            showOtpScreen = false;
            otpValues = ["", "", "", "", "", ""];
            otpError = null;
            loginSuccess = false;
            connectionError = false;
        }, 300); 
    }

    // Derived state for modal content
    /** @type {string} */
    const modalTitle = $derived(
        loginSuccess ? "Login Successful!" :
        showOtpScreen ? "Enter Verification Code" :
        loginError ? (connectionError ? "Connection Error" : "Login Failed") :
        ""
    );

    /** @type {string} */
    const modalDescription = $derived(
        loginSuccess ? "You will be redirected shortly." :
        showOtpScreen ? "A 6-digit code has been sent to your email address." :
        loginError ? loginError :
        ""
    );

</script>

<SEO
    title="Log In"
    description="Log in to your MSSNOAU account to access exclusive content and features."
    path="/auth/login"
    type="WebPage"
    images={[
        {
            url: 'https://mssnoau.sirv.com/og/og-login.jpg',
            width: 1200,
            height: 630,
            alt: 'MSSNOAU Login Page'
        }
    ]}
    schema={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Log In | MSSNOAU",
        "description": "Log in to your MSSNOAU account.",
        "publisher": {
            "@type": "Organization",
            "name": "MSSNOAU"
        }
    }}
    keywords={["mssnoau login", "mssn oau login", "access mssnoau account", "muslim students oau login"]}
/>

<PageHeader>
    Log In
</PageHeader>

<!-- Main Login Form on Page -->
<div class="max-w-md mx-auto px-4 py-8 sm:py-12" in:fly={{ y: 20, duration: 500, delay: 200 }}>
    <div class="text-center mb-8">
        <h1 class="text-2xl sm:text-3xl font-semibold font-secondary text-primary-800">Welcome Back!</h1>
        <p class="text-gray-600 mt-1">Enter your credentials to access your account.</p>
    </div>

    <form onsubmit={handleLogin} class="space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
        <div>
            <Label for="email-main" class="text-sm font-medium">Email Address</Label>
            <Input 
                id="email-main" 
                type="email" 
                placeholder="you@example.com" 
                bind:value={email}
                required
                class="mt-1"
                aria-invalid={email && !isEmailValid ? true : undefined}
            />
            {#if email && !isEmailValid}
            <p class="text-red-600 flex items-center text-xs mt-1.5">
                <AlertCircle class="w-3.5 h-3.5 mr-1 shrink-0" />
                Please enter a valid email address.
            </p>
            {/if}
        </div>
        
        <div>
            <div class="flex justify-between items-center">
                <Label for="password-main" class="text-sm font-medium">Password</Label>
                <a href="/auth/forgot-password" class="text-xs text-primary-600 hover:text-primary-700 hover:underline font-medium">
                    Forgot password?
                </a>
            </div>
            <Input 
                id="password-main" 
                type="password" 
                placeholder="••••••••"
                bind:value={password}
                required
                class="mt-1"
                aria-invalid={password && !isPasswordValid ? true : undefined}
            />
            {#if password && !isPasswordValid}
            <p class="text-red-600 flex items-center text-xs mt-1.5">
                <AlertCircle class="w-3.5 h-3.5 mr-1 shrink-0" />
                Password must be at least 8 characters.
            </p>
            {/if}
        </div>
        
        <Button type="submit" disabled={!isFormValid || isLoading} class="w-full text-base py-3">
            {#if isLoading}
                <Loader2 class="mr-2 h-5 w-5 animate-spin" /> Signing In...
            {:else}
                Sign In
            {/if}
        </Button>

        <div class="text-center text-sm text-gray-600">
            Don't have an account? 
            <a href="/auth/signup" class="font-medium text-primary-600 hover:text-primary-700 hover:underline">Sign up here</a>
        </div>
    </form>
</div>

<!-- Modal for OTP, Success, Error -->
{#if showModal}
    {#await import('$lib/components/layout/ResponsiveModal.svelte') then module}
        {@const ResponsiveModal = module.default}
        <ResponsiveModal 
            bind:open={showModal} 
            title={modalTitle}
            description={modalDescription}
            onOpenChange={(isOpen) => { if (!isOpen) closeModalAndReset(); }}
            contentClass={showOtpScreen ? "sm:max-w-lg" : "sm:max-w-sm"} 
            closeOnOutsideClick={!isOtpLoading && !loginSuccess} 
            closeOnEscape={!isOtpLoading && !loginSuccess} 
        >
            {#if loginSuccess}
                <div class="text-center py-6">
                    <ShieldCheck class="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p class="text-gray-700">You have successfully logged in.</p>
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
                </div>
            {:else if loginError}
                <div class="text-center py-6">
                    {#if connectionError}
                        <MailWarning class="h-16 w-16 text-destructive mx-auto mb-4" />
                    {:else}
                        <AlertCircle class="h-16 w-16 text-destructive mx-auto mb-4" />
                    {/if}
                    <p class="text-gray-700">{loginError || "An unexpected error occurred."}</p>
                </div>
            {/if}

            {#snippet footer()}
                {#if showOtpScreen && !loginSuccess}
                    <Button variant="outline" onclick={closeModalAndReset} disabled={isOtpLoading} class="w-full sm:w-auto">Cancel</Button>
                    <Button onclick={resendOtp} disabled={isOtpLoading || otpResent} class="w-full sm:w-auto">
                        {#if isOtpLoading && !otpResent} <Loader2 class="size-4 mr-2 animate-spin" /> {/if}
                        {otpResent ? 'OTP Sent!' : 'Resend Code'}
                    </Button>
                    <Button onclick={verifyOtp} disabled={isOtpLoading || !isOtpComplete} class="w-full sm:w-auto">
                        {#if isOtpLoading && !isOtpComplete} <Loader2 class="size-4 mr-2 animate-spin" /> {:else if isOtpLoading && isOtpComplete} <Loader2 class="size-4 mr-2 animate-spin" /> {/if}                        Verify OTP
                    </Button>
                {:else if loginError && !loginSuccess}
                    <Button onclick={closeModalAndReset} class="w-full">Close</Button>
                {/if}
                <!-- No footer shown for loginSuccess state as it auto-closes or redirects -->
            {/snippet}
        </ResponsiveModal>
    {/await}
{/if}
