<script>
    import { fly } from 'svelte/transition'
    import { onMount } from 'svelte'
    import { browser } from '$app/environment'
    import { Copy, CheckCircle2, AlertCircle, CreditCard, Download, Printer, Loader2, User, Building2, GraduationCap, Mail, FileText, Clock } from '@lucide/svelte'
    import copyTextToClipboard from "$lib/utils/copy.js"
    import { toast } from "svelte-sonner"
    import SEO from '$lib/components/SEO.svelte'
    import { SITE_URL } from '$lib/config'

    let { data } = $props()

    const API_BASE = 'http://localhost:3000'

    let visible = $state(false)
    let paystackLoaded = $state(false)
    let loading = $state(false)
    let step = $state('form') // 'form' | 'processing' | 'receipt'

    // Form fields
    let fullName = $state('')
    let email = $state('')
    let department = $state('')
    let faculty = $state('')
    let level = $state('')

    // Receipt data
    /** @type {any} */
    let receipt = $state(null)
    let showReceiptModal = $state(false)
    // Tracking for pending verification
    let paymentReference = $state('')
    let paymentId = $state('')

    // Current session & amount (fetched from API config — no hardcoded values)
    let currentSession = $state('')
    let duesAmount = $state(0)

    onMount(() => {
        visible = true
        loadConfig()
    })

    // Load annual dues config from the API (amount + session + Paystack key)
    async function loadConfig() {
        try {
            const cfgRes = await fetch(`${API_BASE}/public/annual-dues/config`)
            const cfg = await cfgRes.json()
            if (cfg.success) {
                duesAmount = Number(cfg.data.amount) || 0
                currentSession = cfg.data.sessionName || ''
            }
        } catch {
            // Paystack will show an error if the key is missing
        }
    }

    // Load Paystack script (reuses config from loadConfig)
    async function loadPaystack() {
        if (!browser) return
        await loadConfig()
        if (paystackLoaded) return
        return new Promise((resolve) => {
            const s = document.createElement('script')
            s.src = 'https://js.paystack.co/v2/inline.js'
            s.onload = () => { paystackLoaded = true; resolve(true) }
            document.head.appendChild(s)
        })
    }

    function validateForm() {
        if (!fullName.trim()) { toast.error("Please enter your full name"); return false }
        if (!email.trim() || !email.includes('@')) { toast.error("Please enter a valid email address"); return false }
        if (!department.trim()) { toast.error("Please enter your department"); return false }
        if (!faculty.trim()) { toast.error("Please enter your faculty"); return false }
        if (!level.trim()) { toast.error("Please enter your level"); return false }
        return true
    }

    async function handleSubmit() {
        if (!validateForm()) return

        loading = true
        step = 'processing'

        try {
            await loadPaystack()

            // Step 1: Create payment record + get Paystack access code
            const res = await fetch(`${API_BASE}/public/annual-dues/initiate-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: fullName.trim(),
                    email: email.trim(),
                    department: department.trim(),
                    faculty: faculty.trim(),
                    level: level.trim()
                })
            })
            const json = await res.json()

            if (!json.success) {
                toast.error(json.error || "Could not initiate payment. Please try again.")
                step = 'form'
                loading = false
                return
            }

            const { accessCode } = json.data
            paymentReference = json.data.paymentReference || ''
            paymentId = json.data.paymentId || ''

            // Step 2: Open Paystack popup
            // V2 inline JS (`new PaystackPop()` + `checkout()`) uses the server-side
            // access code — no key/email/amount/ref needed. The success callback is
            // `onSuccess` (V1 used `callback`, which never fired → payments stuck PENDING).
            const paystackWindow = /** @type {any} */ (window)
            const popup = new paystackWindow.PaystackPop()
            popup.checkout({
                accessCode,
                onSuccess: async (/** @type {{ reference: string }} */ transaction) => {
                    // Step 3: Verify payment
                    try {
                        const vRes = await fetch(`${API_BASE}/public/annual-dues/verify-payment?ref=${transaction.reference}`)
                        const vJson = await vRes.json()

                        if (vJson.success && vJson.data.paid) {
                            receipt = vJson.data.payment
                            step = 'receipt'
                            showReceiptModal = true
                            toast.success("Payment successful! Your receipt is ready.")
                        } else if (vJson.success && vJson.data.status === 'pending') {
                            // Payment received but not yet confirmed (webhook/processing).
                            // Do NOT show the receipt until it is confirmed.
                            step = 'pending'
                            toast.info("Payment received, but confirmation is still in progress. Please check back shortly.")
                        } else {
                            toast.error("Payment failed. Please try again later.")
                            step = 'form'
                        }
                    } catch {
                        toast.error("Payment done but verification failed. Your reference: " + transaction.reference)
                        step = 'form'
                    } finally {
                        loading = false
                    }
                },
                onCancel: () => {
                    toast.error("Payment was cancelled.")
                    step = 'form'
                    loading = false
                },
                onError: (/** @type {{ message?: string }} */ error) => {
                    console.error('Paystack checkout error', error)
                    toast.error(error?.message || "Payment could not be loaded. Please try again.")
                    step = 'form'
                    loading = false
                }
            })
        } catch (err) {
            toast.error("Unable to initiate payment. Please try again.")
            step = 'form'
            loading = false
        }
    }

    // Re-check verification status for a payment still awaiting confirmation
    async function checkStatus() {
        if (!paymentReference) return
        loading = true
        try {
            const vRes = await fetch(`${API_BASE}/public/annual-dues/verify-payment?ref=${paymentReference}`)
            const vJson = await vRes.json()

            if (vJson.success && vJson.data.paid) {
                receipt = vJson.data.payment
                step = 'receipt'
                showReceiptModal = true
                toast.success("Payment confirmed! Your receipt is ready.")
            } else if (vJson.success && vJson.data.status === 'pending') {
                toast.info("Still pending. Confirmation may take a few minutes — check back shortly.")
            } else {
                toast.error("Payment failed. Please try again later.")
                step = 'form'
            }
        } catch {
            toast.error("Could not check payment status. Please try again.")
        } finally {
            loading = false
        }
    }

    function printReceipt() {
        // Close the popup first so the modal portal isn't included in the print
        showReceiptModal = false
        setTimeout(() => window.print(), 100)
    }

    function downloadReceipt() {
        // Generate a printable HTML receipt and open in new window for PDF save
        const receiptHtml = generateReceiptHtml()
        const win = window.open('', '_blank')
        if (!win) {
            toast.error("Could not open a new window. Please allow popups and try again.")
            return
        }
        win.document.write(receiptHtml)
        win.document.close()
        win.focus()
        setTimeout(() => win.print(), 500)
    }

    function generateReceiptHtml() {
        if (!receipt) return ''
        const paidDate = receipt.paidAt ? new Date(receipt.paidAt).toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' }) : 'N/A'
        return `<!DOCTYPE html><html><head><title>Receipt - ${receipt.receiptNumber}</title><style>
            body{font-family:'Segoe UI',Tahoma,sans-serif;margin:0;padding:40px;color:#1a1a1a}
            .receipt{position:relative;overflow:hidden;max-width:600px;margin:0 auto;border:2px solid #166534;border-radius:12px;padding:32px}
            .watermark{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);display:flex;flex-direction:column;align-items:center;gap:6px;color:#166534;opacity:0.07;pointer-events:none;white-space:nowrap;z-index:0}
            .watermark-logo{width:64px;height:64px;object-fit:contain}
            .watermark .wm-title{font-size:38px;font-weight:900;letter-spacing:6px}
            .watermark .wm-ref{font-size:16px;font-weight:700;letter-spacing:2px}
            .header{position:relative;z-index:1;text-align:center;border-bottom:2px solid #166534;padding-bottom:20px;margin-bottom:24px}
            .header h1{margin:0;font-size:22px;color:#166534}.header p{margin:4px 0 0;color:#666;font-size:13px}
            .badge{display:inline-block;background:#dcfce7;color:#166534;padding:4px 16px;border-radius:20px;font-size:13px;font-weight:600;margin-top:8px}
            .info{position:relative;z-index:1;margin:20px 0}.info-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb}
            .info-label{font-size:13px;color:#666}.info-value{font-size:13px;font-weight:600;text-align:right}
            .amount{position:relative;z-index:1;text-align:center;margin:24px 0;padding:20px;background:#f0fdf4;border-radius:8px}
            .amount h2{margin:0;color:#166534;font-size:28px}.amount p{margin:4px 0 0;color:#666;font-size:12px}
            .footer{position:relative;z-index:1;text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#999}
            @media print{body{padding:20px}.receipt{border:2px solid #166534}}
        </style></head><body><div class="receipt">
            <div class="watermark">
                <img src="${window.location.origin}/favicon.png" alt="" class="watermark-logo" />
                <span class="wm-title">MSSN OAU</span>
                <span class="wm-ref">${receipt.receiptNumber}</span>
            </div>
            <div class="header"><h1>MSSN OAU</h1><p>Muslim Students' Society of Nigeria, OAU Branch</p><div class="badge">&#10003; Payment Confirmed</div></div>
            <div class="amount"><h2>&#8358;${Number(receipt.amount).toLocaleString()}</h2><p>Annual Dues - ${receipt.sessionName}</p></div>
            <div class="info">
                <div class="info-row"><span class="info-label">Receipt Number</span><span class="info-value">${receipt.receiptNumber}</span></div>
                <div class="info-row"><span class="info-label">Payment ID</span><span class="info-value">${receipt.id}</span></div>
                <div class="info-row"><span class="info-label">Full Name</span><span class="info-value">${receipt.fullName}</span></div>
                <div class="info-row"><span class="info-label">Email</span><span class="info-value">${receipt.email}</span></div>
                <div class="info-row"><span class="info-label">Department</span><span class="info-value">${receipt.department}</span></div>
                <div class="info-row"><span class="info-label">Faculty</span><span class="info-value">${receipt.faculty}</span></div>
                <div class="info-row"><span class="info-label">Level</span><span class="info-value">${receipt.level}</span></div>
                <div class="info-row"><span class="info-label">Amount Paid</span><span class="info-value">&#8358;${Number(receipt.amount).toLocaleString()}</span></div>
                <div class="info-row"><span class="info-label">Payment Date</span><span class="info-value">${paidDate}</span></div>
                <div class="info-row"><span class="info-label">Reference</span><span class="info-value">${receipt.paymentReference}</span></div>
                <div class="info-row"><span class="info-label">Status</span><span class="info-value">${receipt.status}</span></div>
            </div>
            <div class="footer"><p>This is a computer-generated receipt. No signature required.</p><p>MSSN OAU &bull; ${new Date().getFullYear()}</p></div>
        </div></body></html>`
    }

    const faculties = [
        'Faculty of Administration',
        'Faculty of Agriculture',
        'Faculty of Arts',
        'Faculty of Education',
        'Faculty of Environmental Design & Management',
        'Faculty of Law',
        'Faculty of Medicine',
        'Faculty of Pharmacy',
        'Faculty of Science',
        'Faculty of Social Sciences',
        'Faculty of Technology'
    ]

    const levels = ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', '600 Level', 'Postgraduate']
</script>

<SEO
    title="Pay Annual Dues"
    description="Pay your MSSN OAU annual dues securely online. Support the Muslim Students Society of Nigeria, Obafemi Awolowo University."
    path="/annual-dues"
    type="WebPage"
    images={[{ url: 'https://i.ibb.co/zbWfh5B/home.webp', width: 1200, height: 640, alt: 'MSSNOAU Annual Dues Page' }]}
    schema={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Pay Annual Dues | MSSNOAU",
        "description": "Pay your MSSN OAU annual dues securely online.",
        "url": `${SITE_URL}/annual-dues`,
        "publisher": { "@type": "Organization", "name": "MSSNOAU" }
    }}
    keywords={["mssnoau annual dues", "pay mssn oau dues", "support mssnoau", "muslim students oau finance"]}
/>

<!-- Print-only receipt -->
<div class="print-only">
    {#if receipt}
        {@const paidDate = receipt.paidAt ? new Date(receipt.paidAt).toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' }) : 'N/A'}
        <div class="print-receipt">
            <div class="print-watermark">
                <img src="/favicon.png" alt="" class="print-watermark-logo" />
                <span>MSSN OAU</span>
                <span>{receipt.receiptNumber}</span>
            </div>
            <div class="print-header">
                <h1>MSSN OAU</h1>
                <p>Muslim Students' Society of Nigeria, OAU Branch</p>
                <span class="print-badge">&#10003; Payment Confirmed</span>
            </div>
            <div class="print-amount">
                <h2>&#8358;{Number(receipt.amount).toLocaleString()}</h2>
                <p>Annual Dues - {receipt.sessionName}</p>
            </div>
            <div class="print-info">
                <div class="print-row"><span>Receipt Number</span><span>{receipt.receiptNumber}</span></div>
                <div class="print-row"><span>Payment ID</span><span>{receipt.id}</span></div>
                <div class="print-row"><span>Full Name</span><span>{receipt.fullName}</span></div>
                <div class="print-row"><span>Email</span><span>{receipt.email}</span></div>
                <div class="print-row"><span>Department</span><span>{receipt.department}</span></div>
                <div class="print-row"><span>Faculty</span><span>{receipt.faculty}</span></div>
                <div class="print-row"><span>Level</span><span>{receipt.level}</span></div>
                <div class="print-row"><span>Amount Paid</span><span>&#8358;{Number(receipt.amount).toLocaleString()}</span></div>
                <div class="print-row"><span>Payment Date</span><span>{paidDate}</span></div>
                <div class="print-row"><span>Reference</span><span>{receipt.paymentReference}</span></div>
                <div class="print-row"><span>Status</span><span>{receipt.status}</span></div>
            </div>
            <div class="print-footer">
                <p>This is a computer-generated receipt. No signature required.</p>
            </div>
        </div>
    {/if}
</div>

<section class="py-24 relative overflow-hidden">
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>

    <div class="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto relative z-10">
        <div class="w-full justify-start items-center gap-12 grid lg:grid-cols-2 grid-cols-1">
            {#if visible}
                <!-- Left: Images -->
                <div in:fly={{ x: -30, duration: 800, delay: 200 }}
                    class="w-full justify-center items-start gap-6 grid sm:grid-cols-2 grid-cols-1 lg:order-first order-last"
                >
                    <div class="pt-24 lg:justify-center sm:justify-end justify-start items-start gap-2.5 flex">
                        <img class="rounded-xl object-cover shadow-lg border border-gray-100 transition-transform duration-500 hover:scale-105"
                            src="/images/man_phone.webp" alt="Man with phone" />
                    </div>
                    <img class="sm:ml-0 ml-auto rounded-xl object-cover shadow-lg border border-gray-100 transition-transform duration-500 hover:scale-105"
                        src="/images/woman_laptop.webp" alt="Woman with Laptop" />
                </div>

                <!-- Right: Content -->
                <div in:fly={{ x: 30, duration: 800, delay: 400 }}
                    class="w-full flex-col justify-center lg:items-start items-center gap-10 inline-flex"
                >
                    {#if step === 'form'}
                        <!-- Form Step -->
                        <div class="w-full flex-col justify-center items-start gap-8 flex">
                            <div class="w-full flex-col justify-start lg:items-start items-center gap-3 flex">
                                <h2 class="text-gray-900 text-4xl font-bold font-primary leading-normal lg:text-start text-center relative inline-block">
                                    Pay Annual Dues
                                    <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary-700 rounded-full"></span>
                                </h2>
                                <p class="text-gray-500 text-base font-normal leading-relaxed lg:text-start text-center">
                                    Every year, we are reminded of the incredible impact our collective efforts bring to the MSSNOAU community.
                                    Paying your annual dues is both a testament to and a result of the strength of our brotherhood.
                                </p>
                                <div class="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 ring-1 ring-inset ring-primary-600/20">
                                    &#8358;{duesAmount.toLocaleString()} &bull; {currentSession}
                                </div>
                            </div>
                        </div>

                        <form onsubmit={(e) => { e.preventDefault(); handleSubmit() }} class="w-full space-y-4">
                            <!-- Full Name -->
                            <div>
                                <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <div class="relative">
                                    <User class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input id="fullName" type="text" bind:value={fullName} required
                                        placeholder="e.g. Abdulrozaq Taslim"
                                        class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                </div>
                            </div>

                            <!-- Email -->
                            <div>
                                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                <div class="relative">
                                    <Mail class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input id="email" type="email" bind:value={email} required
                                        placeholder="you@example.com"
                                        class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                </div>
                            </div>

                            <!-- Department -->
                            <div>
                                <label for="department" class="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                                <div class="relative">
                                    <Building2 class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input id="department" type="text" bind:value={department} required
                                        placeholder="e.g. Computer Science"
                                        class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                </div>
                            </div>

                            <!-- Faculty -->
                            <div>
                                <label for="faculty" class="block text-sm font-medium text-gray-700 mb-1">Faculty *</label>
                                <div class="relative">
                                    <GraduationCap class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <select id="faculty" bind:value={faculty} required
                                        class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none">
                                        <option value="">Select Faculty</option>
                                        {#each faculties as f}
                                            <option value={f}>{f}</option>
                                        {/each}
                                    </select>
                                </div>
                            </div>

                            <!-- Level -->
                            <div>
                                <label for="level" class="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                                <div class="relative">
                                    <FileText class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <select id="level" bind:value={level} required
                                        class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none">
                                        <option value="">Select Level</option>
                                        {#each levels as l}
                                            <option value={l}>{l}</option>
                                        {/each}
                                    </select>
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                class="sm:w-fit w-full px-6 py-3 bg-primary-800 hover:bg-primary-800/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 justify-center items-center flex gap-2 text-white text-sm font-medium">
                                <CreditCard class="w-4 h-4" />
                                Pay &#8358;{duesAmount.toLocaleString()}
                            </button>
                        </form>

                    {:else if step === 'processing'}
                        <!-- Processing Step -->
                        <div class="w-full text-center py-12 space-y-4" in:fly={{ y: 20, duration: 400 }}>
                            <Loader2 class="w-12 h-12 text-primary-600 animate-spin mx-auto" />
                            <h3 class="text-lg font-semibold text-gray-900">Processing Payment...</h3>
                            <p class="text-sm text-gray-500">Please complete the payment in the popup window.</p>
                        </div>

                    {:else if step === 'pending'}
                        <!-- Pending Confirmation Step -->
                        <div class="w-full text-center py-8 space-y-5" in:fly={{ y: 20, duration: 400 }}>
                            <div class="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                                <Clock class="w-8 h-8 text-amber-600" />
                            </div>
                            <div class="space-y-1.5">
                                <h3 class="text-lg font-semibold text-gray-900">Payment Received</h3>
                                <p class="text-sm text-gray-500">Your payment has been received, but it is still being confirmed. Your receipt will be available here once it is confirmed.</p>
                            </div>

                            {#if paymentReference}
                                <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mx-auto max-w-sm space-y-1.5 text-center">
                                    <p class="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">Payment Reference</p>
                                    <p class="text-xs font-mono font-semibold text-gray-900 break-all">{paymentReference}</p>
                                    <p class="text-[11px] text-gray-400">Save this reference to check your payment status later.</p>
                                </div>
                            {/if}

                            <div class="flex flex-col sm:flex-row gap-3 justify-center">
                                <button onclick={checkStatus} disabled={loading}
                                    class="px-5 py-2.5 bg-primary-800 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary-700 disabled:opacity-50 transition-colors">
                                    {#if loading}<Loader2 class="w-4 h-4 animate-spin" />{:else}<Clock class="w-4 h-4" />{/if}
                                    Check Status
                                </button>
                                <button onclick={() => { step = 'form'; paymentReference = ''; paymentId = ''; }}
                                    class="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                                    Try Again
                                </button>
                            </div>
                        </div>

                    {:else if step === 'receipt' && receipt}
                        <!-- Receipt Step -->
                        <div class="w-full space-y-6" in:fly={{ y: 20, duration: 600 }}>
                            <div class="text-center space-y-2">
                                <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                                    <CheckCircle2 class="w-8 h-8 text-green-600" />
                                </div>
                                <h2 class="text-2xl font-bold text-gray-900">Payment Successful!</h2>
                                <p class="text-sm text-gray-500">Your annual dues payment has been confirmed.</p>
                            </div>

                            <!-- Receipt Card -->
                            <div class="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                                <!-- Receipt Header -->
                                <div class="bg-gradient-to-r from-green-800 to-green-900 text-white p-6 text-center">
                                    <h3 class="text-lg font-bold">MSSN OAU</h3>
                                    <p class="text-green-200 text-xs">Annual Dues Receipt</p>
                                    <span class="inline-block mt-2 bg-green-600/50 px-3 py-1 rounded-full text-xs font-medium">&#10003; Confirmed</span>
                                </div>

                                <!-- Amount -->
                                <div class="bg-green-50 p-4 text-center border-b border-green-100">
                                    <p class="text-3xl font-bold text-green-800">&#8358;{Number(receipt.amount).toLocaleString()}</p>
                                    <p class="text-xs text-green-600 mt-1">{receipt.sessionName} Session</p>
                                </div>

                                <!-- Details -->
                                <div class="p-6 space-y-3">
                                    <div class="flex justify-between py-2 border-b border-gray-100">
                                        <span class="text-xs text-gray-500">Receipt Number</span>
                                        <span class="text-xs font-semibold text-gray-900">{receipt.receiptNumber}</span>
                                    </div>
                                    <div class="flex justify-between py-2 border-b border-gray-100">
                                        <span class="text-xs text-gray-500">Payment ID</span>
                                        <span class="text-xs font-semibold text-gray-900 font-mono">{receipt.id}</span>
                                    </div>
                                    <div class="flex justify-between py-2 border-b border-gray-100">
                                        <span class="text-xs text-gray-500">Full Name</span>
                                        <span class="text-xs font-semibold text-gray-900">{receipt.fullName}</span>
                                    </div>
                                    <div class="flex justify-between py-2 border-b border-gray-100">
                                        <span class="text-xs text-gray-500">Email</span>
                                        <span class="text-xs font-semibold text-gray-900">{receipt.email}</span>
                                    </div>
                                    <div class="flex justify-between py-2 border-b border-gray-100">
                                        <span class="text-xs text-gray-500">Department</span>
                                        <span class="text-xs font-semibold text-gray-900">{receipt.department}</span>
                                    </div>
                                    <div class="flex justify-between py-2 border-b border-gray-100">
                                        <span class="text-xs text-gray-500">Faculty</span>
                                        <span class="text-xs font-semibold text-gray-900">{receipt.faculty}</span>
                                    </div>
                                    <div class="flex justify-between py-2 border-b border-gray-100">
                                        <span class="text-xs text-gray-500">Level</span>
                                        <span class="text-xs font-semibold text-gray-900">{receipt.level}</span>
                                    </div>
                                    <div class="flex justify-between py-2 border-b border-gray-100">
                                        <span class="text-xs text-gray-500">Amount Paid</span>
                                        <span class="text-xs font-semibold text-green-700">&#8358;{Number(receipt.amount).toLocaleString()}</span>
                                    </div>
                                    <div class="flex justify-between py-2 border-b border-gray-100">
                                        <span class="text-xs text-gray-500">Payment Date</span>
                                        <span class="text-xs font-semibold text-gray-900">
                                            {receipt.paidAt ? new Date(receipt.paidAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                                        </span>
                                    </div>
                                    <div class="flex justify-between py-2 border-b border-gray-100">
                                        <span class="text-xs text-gray-500">Reference</span>
                                        <span class="text-xs font-semibold text-gray-900 font-mono">{receipt.paymentReference}</span>
                                    </div>
                                    <div class="flex justify-between py-2">
                                        <span class="text-xs text-gray-500">Status</span>
                                        <span class="text-xs font-semibold text-green-700 uppercase">{receipt.status}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="flex flex-col sm:flex-row gap-3 justify-center no-print">
                                <button onclick={printReceipt}
                                    class="px-5 py-2.5 bg-primary-800 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors">
                                    <Printer class="w-4 h-4" /> Print Receipt
                                </button>
                                <button onclick={downloadReceipt}
                                    class="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                                    <Download class="w-4 h-4" /> Download PDF
                                </button>
                            </div>

                            <p class="text-center text-xs text-gray-400 no-print">
                                Save your receipt number: <strong>{receipt.receiptNumber}</strong>
                            </p>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</section>

{#if showReceiptModal && receipt}
    {#await import('$lib/components/layout/ResponsiveModal.svelte') then module}
        {@const ResponsiveModal = module.default}
        <ResponsiveModal
            bind:open={showReceiptModal}
            title="Payment Successful"
            description="Your annual dues receipt is ready for download."
        >
            <div class="space-y-4">
                <!-- Amount summary -->
                <div class="bg-green-50 rounded-xl border border-green-100 p-5 text-center">
                    <p class="text-3xl font-bold text-green-800">&#8358;{Number(receipt.amount).toLocaleString()}</p>
                    <p class="text-xs text-green-600 mt-1">{receipt.sessionName} Session</p>
                    <span class="inline-block mt-2 bg-green-600/10 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">&#10003; Confirmed</span>
                </div>

                <!-- Receipt details -->
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between py-2 border-b border-gray-100">
                        <span class="text-xs text-gray-500">Receipt Number</span>
                        <span class="text-xs font-semibold text-gray-900">{receipt.receiptNumber}</span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-gray-100">
                        <span class="text-xs text-gray-500">Payment ID</span>
                        <span class="text-xs font-semibold text-gray-900 font-mono">{receipt.id}</span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-gray-100">
                        <span class="text-xs text-gray-500">Full Name</span>
                        <span class="text-xs font-semibold text-gray-900">{receipt.fullName}</span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-gray-100">
                        <span class="text-xs text-gray-500">Payment Date</span>
                        <span class="text-xs font-semibold text-gray-900">
                            {receipt.paidAt ? new Date(receipt.paidAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                        </span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-col sm:flex-row gap-3">
                    <button onclick={downloadReceipt}
                        class="flex-1 px-5 py-2.5 bg-primary-800 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors">
                        <Download class="w-4 h-4" /> Download PDF
                    </button>
                    <button onclick={printReceipt}
                        class="flex-1 px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                        <Printer class="w-4 h-4" /> Print Receipt
                    </button>
                </div>

                <!-- Done -->
                <button onclick={() => (showReceiptModal = false)}
                    class="w-full px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
                    Done
                </button>
            </div>
        </ResponsiveModal>
    {/await}
{/if}

<style>
    @media print {
        .no-print { display: none !important; }
        section { display: none !important; }
    }
    .print-only { display: none; }
    @media print {
        .print-only { display: block; }
        .print-receipt {
            max-width: 600px; margin: 0 auto; padding: 32px;
            font-family: 'Segoe UI', Tahoma, sans-serif; color: #1a1a1a;
            border: 2px solid #166534; border-radius: 12px;
            position: relative; overflow: hidden;
        }
        .print-watermark {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            display: flex; flex-direction: column; align-items: center; gap: 6px;
            color: #166534; opacity: 0.07; white-space: nowrap; pointer-events: none;
            z-index: 0; font-weight: 900; font-size: 38px; letter-spacing: 6px;
        }
        .print-watermark-logo {
            width: 64px; height: 64px; object-fit: contain;
        }
        .print-watermark span:last-child { font-size: 16px; letter-spacing: 2px; }
        .print-header { position: relative; z-index: 1; text-align: center; border-bottom: 2px solid #166534; padding-bottom: 16px; margin-bottom: 20px; }
        .print-header h1 { margin: 0; font-size: 22px; color: #166534; }
        .print-header p { margin: 4px 0 0; color: #666; font-size: 12px; }
        .print-badge { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }
        .print-amount { position: relative; z-index: 1; text-align: center; padding: 16px; background: #f0fdf4; border-radius: 8px; margin-bottom: 20px; }
        .print-amount h2 { margin: 0; color: #166534; font-size: 28px; }
        .print-amount p { margin: 4px 0 0; color: #666; font-size: 12px; }
        .print-info { position: relative; z-index: 1; margin: 16px 0; }
        .print-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
        .print-row span:first-child { color: #666; }
        .print-row span:last-child { font-weight: 600; text-align: right; }
        .print-footer { text-align: center; margin-top: 20px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #999; }
    }
</style>
