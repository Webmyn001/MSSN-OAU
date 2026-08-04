<script>
    import { toast } from 'svelte-sonner';
    import { Mail, Send, Loader2 } from '@lucide/svelte';
    import { API_BASE } from '$lib/api/base';

    let email = $state('');
    let loading = $state(false);

    const API_URL = `${API_BASE}/public/newsletter/subscribe`;

    async function handleSubscribe(e) {
        e.preventDefault();
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedEmail || !trimmedEmail.includes('@')) {
            toast.error('Please enter a valid email address.');
            return;
        }

        loading = true;

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmedEmail })
            });

            const json = await res.json();

            if (json.success) {
                toast.success(json.data?.message || 'Thank you for subscribing to our newsletter!');
                email = '';
            } else {
                toast.error(json.error || 'Failed to subscribe. Please try again.');
            }
        } catch (err) {
            toast.error('Could not connect to subscription server. Please try again later.');
        } finally {
            loading = false;
        }
    }
</script>

<div class="bg-primary-900/90 text-white rounded-2xl p-6 sm:p-8 border border-primary-700/50 shadow-xl relative overflow-hidden backdrop-blur-sm">
    <div class="absolute -right-12 -top-12 w-48 h-48 bg-primary-500/10 rounded-full blur-2xl"></div>
    
    <div class="relative z-10 max-w-xl mx-auto text-center space-y-4">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-amber-300 border border-white/20 shadow-inner">
            <Mail class="w-6 h-6" />
        </div>
        
        <h3 class="text-xl sm:text-2xl font-bold font-primary tracking-tight">
            Subscribe to Our Newsletter
        </h3>
        
        <p class="text-xs sm:text-sm text-primary-100 font-secondary leading-relaxed">
            Get latest news, event announcements, press releases, and Islamic articles sent directly to your inbox.
        </p>

        <form onsubmit={handleSubscribe} class="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <div class="relative w-full">
                <input
                    type="email"
                    bind:value={email}
                    required
                    placeholder="Enter your email address..."
                    class="w-full px-4 py-3 text-xs sm:text-sm rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-primary-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white/20 transition-all"
                />
            </div>
            
            <button
                type="submit"
                disabled={loading}
                class="w-full sm:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 text-primary-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
                {#if loading}
                    <Loader2 class="w-4 h-4 animate-spin" />
                    <span>Subscribing...</span>
                {:else}
                    <span>Subscribe Now</span>
                    <Send class="w-4 h-4" />
                {/if}
            </button>
        </form>
    </div>
</div>
