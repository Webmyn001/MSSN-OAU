<script>
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Sheet from "$lib/components/ui/sheet";
    import * as Tabs from "$lib/components/ui/tabs";
    import { AlertCircle, Loader2, Check, X } from '@lucide/svelte';
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import { MetaTags, JsonLd } from "svelte-meta-tags";
    import * as Form from '$lib/components/ui/form';
    
    // State management
    let email = $state("");
    let password = $state("");
    let isLoading = $state(false);
    let loginError = $state("");
    let showOtpScreen = $state(false);
    let showModal = $state(false);
    let otpValues = $state(["", "", "", "", "", ""]);
    let otpError = $state("");
    let isOtpLoading = $state(false);
    let otpResent = $state(false);
    let loginSuccess = $state(false);
    let isEmailValid = $state(false);
    let isPasswordValid = $state(false);
    let connectionError = $state(false); // Add flag for connection errors
    
    // Responsive state
    let isMobile = $state(false);
    
    // Form validation
    $effect(() => {
        isEmailValid = email.includes('@') && email.includes('.');
        isPasswordValid = password.length >= 8;
    })
    
    const isFormValid = $derived(isEmailValid && isPasswordValid);
    const isOtpComplete = $derived(otpValues.every(v => v !== ""));
    
    onMount(() => {
        // Check window size for responsiveness
        checkWindowSize();
        window.addEventListener('resize', checkWindowSize);
        
        return () => {
            window.removeEventListener('resize', checkWindowSize);
        };
    });
    
    function checkWindowSize() {
        isMobile = window.innerWidth < 768;
    }
    
    function handleLogin() {
        if (!isFormValid) return;
        
        isLoading = true;
        loginError = null;
        connectionError = false; // Reset connection error
        
        // Simulate API call
        setTimeout(() => {
            isLoading = false;
            
            // Mock successful login attempt leading to OTP verification
            showOtpScreen = true;
            showModal = true;
        }, 1500);
    }
    
    function handleOtpInputChange(index, event) {
        const value = event.target.value;
        
        // Only allow numbers
        if (!/^\d*$/.test(value)) {
            return;
        }
        
        // Update the current input
        otpValues[index] = value.charAt(0);
        
        // Auto-focus next input if current input is filled
        if (value && index < otpValues.length - 1) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
        
        // Update the array reactively
        otpValues = [...otpValues];
    }
    
    function handleOtpKeyDown(index, event) {
        // Handle backspace to move to previous input
        if (event.key === 'Backspace' && !otpValues[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    }
    
    function verifyOtp() {
        if (!isOtpComplete) return;
        
        isOtpLoading = true;
        otpError = null;
        
        // Simulate API call for OTP verification
        setTimeout(() => {
            isOtpLoading = false;
            
            // Simulate successful OTP verification
            if (otpValues.join('') === '123456') {
                loginSuccess = true;
                
                // Redirect after successful login
                setTimeout(() => {
                    window.location.href = '/'; // Redirect to home page
                }, 2000);
            } else {
                otpError = "Invalid OTP code. Please try again.";
            }
        }, 1500);
    }
    
    function resendOtp() {
        otpResent = true;
        setTimeout(() => {
            otpResent = false;
        }, 3000);
    }
    
    function resetForm() {
        email = "";
        password = "";
        isLoading = false;
        loginError = null;
        showOtpScreen = false;
        showModal = false;
        otpValues = ["", "", "", "", "", ""];
        otpError = null;
        isOtpLoading = false;
        otpResent = false;
        loginSuccess = false;
    }
    
    function closeModal() {
        showModal = false;
        // If OTP screen was shown but not successfully completed, reset it
        if (showOtpScreen && !loginSuccess) {
            showOtpScreen = false;
            otpValues = ["", "", "", "", "", ""];
            otpError = null;
        }
    }
    
    // Simulate connection error handler (in a real app, this would be triggered by network failures)
    function simulateConnectionError() {
        connectionError = true;
        isLoading = false;
        loginError = "Unable to connect to authentication server. Please check your network connection.";
    }
</script>

<!-- Meta Tags -->
<MetaTags
    title="Log In"
    titleTemplate="%s | MSSNOAU"
    description="Log in to your MSSNOAU account to access exclusive content and features."
    canonical="https://mssnoau-frontend.vercel.app/auth/login"
    openGraph={{
        url: 'https://mssnoau-frontend.vercel.app/auth/login',
        title: 'Log In | MSSNOAU',
        description: 'Log in to your MSSNOAU account to access exclusive content and features.',
        images: [
            {
                url: 'https://i.ibb.co/zbWfh5B/home.webp',
                width: 1200,
                height: 640,
                alt: 'MSSNOAU Login'
            }
        ],
        siteName: 'MSSNOAU'
    }}
/>
<JsonLd schema={{
    "@type": "WebPage",
    "name": "Log In | MSSNOAU",
    "description": "Log in to your MSSNOAU account to access exclusive content and features.",
    "publisher": {
        "@type": "Organization",
        "name": "MSSNOAU.org"
    }
}}
/>
<!-- End Meta Tags -->

<PageHeader>
    Log In
</PageHeader>

<!-- Main Login Form on Page -->
<div class="max-w-md mx-auto px-4 py-8">
    <div class="text-center mb-8">
        <h1 class="text-2xl font-semibold font-secondary text-primary-700">Welcome Back</h1>
        <p class="text-gray-600">Enter your credentials to access your account</p>
    </div>

    <div class="space-y-4">
        <div>
            <Label for="email-main">Email</Label>
            <Input 
                id="email-main" 
                type="email" 
                placeholder="Enter your email" 
                bind:value={email}
                required
            />
            {#if email && !isEmailValid}
            <p class="text-red-500 flex items-center text-xs mt-1">
                <AlertCircle class="w-3 h-3 mr-1" />
                Please enter a valid email address
            </p>
            {/if}
        </div>
        
        <div>
            <div class="flex justify-between items-center">
                <Label for="password-main">Password</Label>
                <a href="/auth/forgot-password" class="text-xs text-primary-600 hover:text-primary-700 font-medium">
                    Forgot password?
                </a>
            </div>
            <Input 
                id="password-main" 
                type="password" 
                placeholder="Enter your password" 
                bind:value={password}
                required
            />
            {#if password && !isPasswordValid}
            <p class="text-red-500 flex items-center text-xs mt-1">
                <AlertCircle class="w-3 h-3 mr-1" />
                Password must be at least 8 characters long
            </p>
            {/if}
        </div>
        
        {#if loginError}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative text-sm" role="alert">
            <div class="flex items-center">
                <AlertCircle class="w-4 h-4 mr-2" />
                <span>{loginError}</span>
            </div>
        </div>
        {/if}
        
        {#if connectionError}
        <div class="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg relative text-sm" role="alert">
            <div class="flex items-center">
                <AlertCircle class="w-4 h-4 mr-2" />
                <span>Unable to connect to authentication server. Please try again later or contact support.</span>
            </div>
            <div class="mt-2 text-xs">
                <button class="text-amber-800 underline" onclick={handleLogin}>
                    Retry Connection
                </button>
            </div>
        </div>
        {/if}
        
        <Button 
            type="submit"
            class="w-full font-medium font-secondary"
            disabled={!isFormValid || isLoading}
            onclick={handleLogin}
        >
            {#if isLoading}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Logging in...
            {:else}
            Log In
            {/if}
        </Button>
        
        <div class="text-center mt-4">
            <p class="text-sm text-gray-600">
                Don't have an account?
                <a href="/auth/signup" class="text-primary-600 hover:text-primary-700 font-medium">
                    Sign up
                </a>
            </p>
        </div>
    </div>
</div>

<!-- Desktop View: Dialog (OTP and success messages only) -->
{#if !isMobile && showModal}
<Dialog.Root open={true} onOpenChange={closeModal}>
    <Dialog.Content class="max-w-md mx-auto sm:max-w-md">
        <div 
            class="relative" 
            in:fly={{ y: 20, duration: 300, delay: 150 }}
        >
            <Dialog.Header>
                <Dialog.Title class="text-2xl font-semibold font-secondary text-primary-700 text-center">
                    {#if loginSuccess}
                        Login Successful!
                    {:else if showOtpScreen}
                        Verify Your Account
                    {/if}
                </Dialog.Title>
                <Dialog.Description class="text-center">
                    {#if loginSuccess}
                        Redirecting you to the dashboard...
                    {:else if showOtpScreen}
                        We've sent a 6-digit code to your email. Please enter it below to verify your identity.
                    {/if}
                </Dialog.Description>
            </Dialog.Header>

            {#if loginSuccess}
                <div class="flex flex-col items-center justify-center p-8">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Check class="h-8 w-8 text-green-600" />
                    </div>
                    <p class="text-center text-sm text-gray-500 mt-2">Logging you in...</p>
                </div>
            {:else if showOtpScreen}
                <!-- OTP Input -->
                <div class="mt-6 space-y-4">
                    <div class="text-center mb-6">
                        <Label class="text-sm font-medium text-gray-700">Enter the 6-digit OTP</Label>
                        
                        <div class="mt-3 flex justify-center gap-2">
                            {#each otpValues as _, index}
                            <Input
                                id={`otp-${index}`}
                                type="text"
                                inputmode="numeric"
                                maxlength="1"
                                class="w-12 h-12 text-center font-bold text-xl"
                                value={otpValues[index]}
                                oninput={(e) => handleOtpInputChange(index, e)}
                                onkeydown={(e) => handleOtpKeyDown(index, e)}
                            />
                            {/each}
                        </div>
                        
                        {#if otpError}
                        <div class="mt-3 flex items-center text-red-500 text-sm">
                            <AlertCircle class="w-4 h-4 mr-1" />
                            <span>{otpError}</span>
                        </div>
                        {/if}
                        
                        {#if otpResent}
                        <div class="mt-3 flex items-center justify-center text-green-600 text-sm">
                            <Check class="w-4 h-4 mr-1" />
                            <span>OTP sent successfully!</span>
                        </div>
                        {/if}
                    </div>
                    
                    <Button 
                        class="w-full font-medium font-secondary"
                        disabled={!isOtpComplete || isOtpLoading}
                        onclick={verifyOtp}
                    >
                        {#if isOtpLoading}
                        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                        {:else}
                        Verify OTP
                        {/if}
                    </Button>
                    
                    <div class="text-center">
                        <button 
                            type="button" 
                            class="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            onclick={resendOtp}
                            disabled={otpResent}
                        >
                            Didn't receive the code? Resend
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    </Dialog.Content>
</Dialog.Root>
{:else if isMobile && showModal}
<!-- Mobile View: Sheet (OTP and success messages only) -->
<Sheet.Root open={true} onOpenChange={closeModal}>
    <Sheet.Content side="bottom" class="h-[80vh] rounded-t-xl px-4">
        <div 
            class="relative h-full flex flex-col" 
            in:fly={{ y: 20, duration: 300, delay: 150 }}
        >
            <Sheet.Header class="text-center">
                <Sheet.Title class="text-xl font-semibold font-secondary text-primary-700">
                    {#if loginSuccess}
                        Login Successful!
                    {:else if showOtpScreen}
                        Verify Your Account
                    {/if}
                </Sheet.Title>
                <Sheet.Description>
                    {#if loginSuccess}
                        Redirecting you to the dashboard...
                    {:else if showOtpScreen}
                        We've sent a 6-digit code to your email. Please enter it below to verify your identity.
                    {/if}
                </Sheet.Description>
            </Sheet.Header>
            
            <div class="flex-grow">
                {#if loginSuccess}
                    <div class="flex flex-col items-center justify-center p-8">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Check class="h-8 w-8 text-green-600" />
                        </div>
                        <p class="text-center text-sm text-gray-500 mt-2">Logging you in...</p>
                    </div>
                {:else if showOtpScreen}
                    <!-- OTP Input -->
                    <div class="mt-6 space-y-4">
                        <div class="text-center mb-6">
                            <Label class="text-sm font-medium text-gray-700">Enter the 6-digit OTP</Label>
                            
                            <div class="mt-3 flex justify-center gap-2">
                                {#each otpValues as _, index}
                                <Input
                                    id={`otp-mobile-${index}`}
                                    type="text"
                                    inputmode="numeric"
                                    maxlength="1"
                                    class="w-10 h-12 text-center font-bold text-xl"
                                    value={otpValues[index]}
                                    oninput={(e) => handleOtpInputChange(index, e)}
                                    onkeydown={(e) => handleOtpKeyDown(index, e)}
                                />
                                {/each}
                            </div>
                            
                            {#if otpError}
                            <div class="mt-3 flex items-center text-red-500 text-sm">
                                <AlertCircle class="w-4 h-4 mr-1" />
                                <span>{otpError}</span>
                            </div>
                            {/if}
                            
                            {#if otpResent}
                            <div class="mt-3 flex items-center justify-center text-green-600 text-sm">
                                <Check class="w-4 h-4 mr-1" />
                                <span>OTP sent successfully!</span>
                            </div>
                            {/if}
                        </div>
                        
                        <Button 
                            class="w-full font-medium font-secondary"
                            disabled={!isOtpComplete || isOtpLoading}
                            onclick={verifyOtp}
                        >
                            {#if isOtpLoading}
                            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                            {:else}
                            Verify OTP
                            {/if}
                        </Button>
                        
                        <div class="text-center">
                            <button 
                                type="button" 
                                class="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                onclick={resendOtp}
                                disabled={otpResent}
                            >
                                Didn't receive the code? Resend
                            </button>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </Sheet.Content>
</Sheet.Root>
{/if}

<!-- SEO and accessibility friendly content for the page when no JS - this will be hidden via JS -->
<div class="max-w-md mx-auto px-4 py-8" id="fallback-content">
    <div class="space-y-4">
        <div>
            <Label for="email-fallback">Email</Label>
            <Input id="email-fallback" type="email" placeholder="Enter your email" required />
        </div>
        
        <div>
            <Label for="password-fallback">Password</Label>
            <Input id="password-fallback" type="password" placeholder="Enter your password" required />
        </div>
        
        <Button type="submit" class="w-full font-medium font-secondary">
            Log In
        </Button>
        
        <div class="text-center mt-4">
            <p class="text-sm text-gray-600">
                Don't have an account?
                <a href="/auth/signup" class="text-primary-600 hover:text-primary-700 font-medium">
                    Sign up
                </a>
            </p>
        </div>
    </div>
</div>
