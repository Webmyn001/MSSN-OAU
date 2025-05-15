<script>
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Sheet from "$lib/components/ui/sheet";
    import * as Tabs from "$lib/components/ui/tabs";
    import { AlertCircle, Loader2, Check, X, Eye, EyeOff } from '@lucide/svelte';
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import { MetaTags, JsonLd } from "svelte-meta-tags";
    import * as Form from '$lib/components/ui/form';
    
    // State management
    let firstName = "";
    let lastName = "";
    let matricNo = "";
    let referenceNo = "";
    let email = "";
    let password = "";
    let confirmPassword = "";
    let showPassword = false;
    let showConfirmPassword = false;
    let isLoading = false;
    let signupError = null;
    let showOtpScreen = false;
    let showModal = false;
    let otpValues = ["", "", "", "", "", ""];
    let otpError = null;
    let isOtpLoading = false;
    let otpResent = false;
    let signupSuccess = false;
    
    // Responsive state
    let isMobile = false;
    
    // Form validation
    $: isFirstNameValid = firstName.length > 1;
    $: isLastNameValid = lastName.length > 1;
    $: isMatricValid = /^[A-Z]{3}\/\d{4}\/\d{3}$/.test(matricNo);
    $: isReferenceValid = /^\d{12}[A-Z]{2}$/.test(referenceNo);
    $: isEmailValid = email.includes('@') && email.includes('.');
    $: isPasswordValid = password.length >= 8;
    $: doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;
    $: isFormValid = isFirstNameValid && isLastNameValid && isMatricValid && isReferenceValid && isEmailValid && isPasswordValid && doPasswordsMatch;
    $: isOtpComplete = otpValues.every(v => v !== "");
    
    onMount(() => {
        // Check window size for responsiveness
        checkWindowSize();
        window.addEventListener('resize', checkWindowSize);
        
        // Hide fallback content once components are loaded
        if (typeof window !== 'undefined') {
            const hideFallback = () => {
                const fallback = document.getElementById('fallback-content');
                if (fallback) fallback.style.display = 'none';
            };
            
            // Try immediately and also on DOMContentLoaded
            hideFallback();
            window.addEventListener('DOMContentLoaded', hideFallback);
        }
        
        return () => {
            window.removeEventListener('resize', checkWindowSize);
            if (typeof window !== 'undefined') {
                window.removeEventListener('DOMContentLoaded', () => {});
            }
        };
    });
    
    function checkWindowSize() {
        isMobile = window.innerWidth < 768;
    }
    
    function handleSignup() {
        if (!isFormValid) return;
        
        isLoading = true;
        signupError = null;
        
        // Simulate API call
        setTimeout(() => {
            isLoading = false;
            
            // Check for demo error conditions
            if (email === "error@example.com") {
                signupError = "An account with this email already exists.";
                return;
            }
            
            if (matricNo === "CSC/2022/999") {
                signupError = "This matric number is already registered.";
                return;
            }
            
            // Mock successful signup attempt leading to OTP verification
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
                signupSuccess = true;
                
                // Redirect after successful signup
                setTimeout(() => {
                    window.location.href = '/auth/login'; // Redirect to login page
                }, 2000);
            } else {
                otpError = "Invalid OTP code. Please try again.";
            }
        }, 1500);
    }
    
    function formatMatricNo(value) {
        // Remove non-alphanumeric characters
        let cleaned = value.replace(/[^A-Za-z0-9]/g, '');
        
        // Convert to uppercase
        cleaned = cleaned.toUpperCase();
        
        // Apply the format DEP/2020/100
        if (cleaned.length <= 3) {
            return cleaned;
        } else if (cleaned.length <= 7) {
            return `${cleaned.substring(0, 3)}/${cleaned.substring(3)}`;
        } else {
            return `${cleaned.substring(0, 3)}/${cleaned.substring(3, 7)}/${cleaned.substring(7, 10)}`;
        }
    }
    
    function handleMatricInput(event) {
        const value = event.target.value;
        matricNo = formatMatricNo(value);
    }
    
    function formatReferenceNo(value) {
        // Remove non-alphanumeric characters
        let cleaned = value.replace(/[^A-Za-z0-9]/g, '');
        
        // Convert last two characters to uppercase if they're letters
        if (cleaned.length > 12) {
            const lastTwo = cleaned.substring(12).toUpperCase();
            cleaned = cleaned.substring(0, 12) + lastTwo;
        }
        
        return cleaned.substring(0, 14); // Limit to 14 characters (12 digits + 2 letters)
    }
    
    function handleReferenceInput(event) {
        const value = event.target.value;
        referenceNo = formatReferenceNo(value);
    }
    
    function resendOtp() {
        otpResent = true;
        setTimeout(() => {
            otpResent = false;
        }, 3000);
    }
    
    function resetForm() {
        firstName = "";
        lastName = "";
        matricNo = "";
        referenceNo = "";
        email = "";
        password = "";
        confirmPassword = "";
        isLoading = false;
        signupError = null;
        showOtpScreen = false;
        showModal = false;
        otpValues = ["", "", "", "", "", ""];
        otpError = null;
        isOtpLoading = false;
        otpResent = false;
        signupSuccess = false;
    }
    
    function togglePasswordVisibility() {
        showPassword = !showPassword;
    }
    
    function toggleConfirmPasswordVisibility() {
        showConfirmPassword = !showConfirmPassword;
    }
    
    function closeModal() {
        showModal = false;
        // If OTP screen was shown but not successfully completed, reset it
        if (showOtpScreen && !signupSuccess) {
            showOtpScreen = false;
            otpValues = ["", "", "", "", "", ""];
            otpError = null;
        }
    }
</script>

<!-- Meta Tags -->
<MetaTags
    title="Sign Up"
    titleTemplate="%s | MSSNOAU"
    description="Join MSSNOAU and register for an account to access exclusive content and features."
    canonical="https://mssnoau-frontend.vercel.app/auth/signup"
    openGraph={{
        url: 'https://mssnoau-frontend.vercel.app/auth/signup',
        title: 'Sign Up | MSSNOAU',
        description: 'Join MSSNOAU and register for an account to access exclusive content and features.',
        images: [
            {
                url: 'https://i.ibb.co/zbWfh5B/home.webp',
                width: 1200,
                height: 640,
                alt: 'MSSNOAU Signup'
            }
        ],
        siteName: 'MSSNOAU'
    }}
/>
<JsonLd schema={{
    "@type": "WebPage",
    "name": "Sign Up | MSSNOAU",
    "description": "Join MSSNOAU and register for an account to access exclusive content and features.",
    "publisher": {
        "@type": "Organization",
        "name": "MSSNOAU.org"
    }
}}
/>
<!-- End Meta Tags -->

<PageHeader>
    Sign Up
</PageHeader>

<!-- Main Signup Form on Page -->
<div class="max-w-xl mx-auto px-4 py-8">
    <div class="text-center mb-8">
        <h1 class="text-2xl font-semibold font-secondary text-primary-700">Create Your Account</h1>
        <p class="text-gray-600">Please fill in the details below to create your MSSNOAU account</p>
    </div>

    <div class="space-y-6">
        <!-- Name Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label for="firstName">First Name</Label>
                <Input 
                    id="firstName" 
                    type="text" 
                    placeholder="Enter your first name" 
                    bind:value={firstName}
                    required
                />
                {#if firstName && !isFirstNameValid}
                <p class="text-red-500 flex items-center text-xs mt-1">
                    <AlertCircle class="w-3 h-3 mr-1" />
                    First name is required
                </p>
                {/if}
            </div>
            
            <div>
                <Label for="lastName">Last Name</Label>
                <Input 
                    id="lastName" 
                    type="text" 
                    placeholder="Enter your last name" 
                    bind:value={lastName}
                    required
                />
                {#if lastName && !isLastNameValid}
                <p class="text-red-500 flex items-center text-xs mt-1">
                    <AlertCircle class="w-3 h-3 mr-1" />
                    Last name is required
                </p>
                {/if}
            </div>
        </div>
        
        <!-- ID Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label for="matricNo">Matric Number</Label>
                <p class="text-xs text-gray-500 mb-1">
                    Format: DEP/2020/100
                </p>
                <Input 
                    id="matricNo" 
                    type="text" 
                    placeholder="e.g., DEP/2020/100" 
                    bind:value={matricNo}
                    on:input={handleMatricInput}
                    required
                />
                {#if matricNo && !isMatricValid}
                <p class="text-red-500 flex items-center text-xs mt-1">
                    <AlertCircle class="w-3 h-3 mr-1" />
                    Invalid matric number format
                </p>
                {/if}
            </div>
            
            <div>
                <Label for="referenceNo">Reference Number</Label>
                <p class="text-xs text-gray-500 mb-1">
                    Format: 202011103463CA
                </p>
                <Input 
                    id="referenceNo" 
                    type="text" 
                    placeholder="e.g., 202011103463CA"
                    bind:value={referenceNo}
                    on:input={handleReferenceInput}
                    required
                />
                {#if referenceNo && !isReferenceValid}
                <p class="text-red-500 flex items-center text-xs mt-1">
                    <AlertCircle class="w-3 h-3 mr-1" />
                    Invalid reference number format
                </p>
                {/if}
            </div>
        </div>
        
        <!-- Email -->
        <div>
            <Label for="email">Email</Label>
            <Input 
                id="email" 
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
        
        <!-- Password Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label for="password">Password</Label>
                <div class="relative">
                    <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password" 
                        bind:value={password}
                        required
                    />
                    <button 
                        type="button" 
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                        onclick={togglePasswordVisibility}
                    >
                        {#if showPassword}
                            <EyeOff class="h-5 w-5" />
                        {:else}
                            <Eye class="h-5 w-5" />
                        {/if}
                    </button>
                </div>
                {#if password && !isPasswordValid}
                <p class="text-red-500 flex items-center text-xs mt-1">
                    <AlertCircle class="w-3 h-3 mr-1" />
                    Password must be at least 8 characters
                </p>
                {/if}
            </div>
            
            <div>
                <Label for="confirmPassword">Confirm Password</Label>
                <div class="relative">
                    <Input 
                        id="confirmPassword" 
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password" 
                        bind:value={confirmPassword}
                        required
                    />
                    <button 
                        type="button" 
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                        onclick={toggleConfirmPasswordVisibility}
                    >
                        {#if showConfirmPassword}
                            <EyeOff class="h-5 w-5" />
                        {:else}
                            <Eye class="h-5 w-5" />
                        {/if}
                    </button>
                </div>
                {#if confirmPassword && !doPasswordsMatch}
                <p class="text-red-500 flex items-center text-xs mt-1">
                    <AlertCircle class="w-3 h-3 mr-1" />
                    Passwords do not match
                </p>
                {/if}
            </div>
        </div>
        
        {#if signupError}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative text-sm" role="alert">
            <div class="flex items-center">
                <AlertCircle class="w-4 h-4 mr-2" />
                <span>{signupError}</span>
            </div>
        </div>
        {/if}
        
        <Button 
            type="submit"
            class="w-full font-medium font-secondary"
            disabled={!isFormValid || isLoading}
            onclick={handleSignup}
        >
            {#if isLoading}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
            {:else}
            Sign Up
            {/if}
        </Button>
        
        <div class="text-center mt-4">
            <p class="text-sm text-gray-600">
                Already have an account?
                <a href="/auth/login" class="text-primary-600 hover:text-primary-700 font-medium">
                    Log in
                </a>
            </p>
        </div>
    </div>
</div>

<!-- Desktop View: Dialog (OTP and success messages only) -->
{#if !isMobile && showModal}
<Dialog.Root open={true} onOpenChange={closeModal}>
    <Dialog.Content class="max-w-md mx-auto sm:max-w-lg">
        <div 
            class="relative" 
            in:fly={{ y: 20, duration: 300, delay: 150 }}
        >
            <Dialog.Header>
                <Dialog.Title class="text-2xl font-semibold font-secondary text-primary-700 text-center">
                    {#if signupSuccess}
                        Registration Successful!
                    {:else if showOtpScreen}
                        Verify Your Account
                    {/if}
                </Dialog.Title>
                <Dialog.Description class="text-center">
                    {#if signupSuccess}
                        Your account has been created successfully. Redirecting you to the login page...
                    {:else if showOtpScreen}
                        We've sent a 6-digit code to your email. Please enter it below to verify your identity.
                    {/if}
                </Dialog.Description>
            </Dialog.Header>

            {#if signupSuccess}
                <div class="flex flex-col items-center justify-center p-8">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Check class="h-8 w-8 text-green-600" />
                    </div>
                    <p class="text-center text-sm text-gray-500 mt-2">Creating your account...</p>
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
                                on:input={(e) => handleOtpInputChange(index, e)}
                                on:keydown={(e) => handleOtpKeyDown(index, e)}
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
    <Sheet.Content side="bottom" class="h-[90vh] rounded-t-xl px-4">
        <div 
            class="relative h-full flex flex-col" 
            in:fly={{ y: 20, duration: 300, delay: 150 }}
        >
            <Sheet.Header class="text-center mb-4">
                <Sheet.Title class="text-xl font-semibold font-secondary text-primary-700">
                    {#if signupSuccess}
                        Registration Successful!
                    {:else if showOtpScreen}
                        Verify Your Account
                    {/if}
                </Sheet.Title>
                <Sheet.Description>
                    {#if signupSuccess}
                        Your account has been created successfully. Redirecting you to the login page...
                    {:else if showOtpScreen}
                        We've sent a 6-digit code to your email. Please enter it below to verify your identity.
                    {/if}
                </Sheet.Description>
            </Sheet.Header>
            
            <div class="flex-grow overflow-y-auto">
                {#if signupSuccess}
                    <div class="flex flex-col items-center justify-center p-8">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Check class="h-8 w-8 text-green-600" />
                        </div>
                        <p class="text-center text-sm text-gray-500 mt-2">Creating your account...</p>
                    </div>
                {:else if showOtpScreen}
                    <!-- OTP Input -->
                    <div class="space-y-4 px-2">
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
                                    on:input={(e) => handleOtpInputChange(index, e)}
                                    on:keydown={(e) => handleOtpKeyDown(index, e)}
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
            <Label for="firstName-fallback">First Name</Label>
            <Input id="firstName-fallback" type="text" placeholder="Enter your first name" required />
        </div>
        
        <div>
            <Label for="lastName-fallback">Last Name</Label>
            <Input id="lastName-fallback" type="text" placeholder="Enter your last name" required />
        </div>
        
        <div>
            <Label for="email-fallback">Email</Label>
            <Input id="email-fallback" type="email" placeholder="Enter your email" required />
        </div>
        
        <div>
            <Label for="matricNo-fallback">Matric Number</Label>
            <Input id="matricNo-fallback" type="text" placeholder="e.g., DEP/2020/100" required />
        </div>
        
        <Button type="submit" class="w-full font-medium font-secondary">
            Sign Up
        </Button>
        
        <div class="text-center mt-4">
            <p class="text-sm text-gray-600">
                Already have an account?
                <a href="/auth/login" class="text-primary-600 hover:text-primary-700 font-medium">
                    Log in
                </a>
            </p>
        </div>
    </div>
</div>
