import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
// Temporarily comment out Sentry imports until dependencies are resolved
// import { sentrySvelteKit } from "@sentry/sveltekit";
// import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
    build: {
        sourcemap: true, // Source map generation must be turned on
        minify: 'terser', // Use terser for better minification
        terserOptions: {
            compress: {
                drop_console: true, // Remove console.log in production
                drop_debugger: true,
                passes: 2, // Additional optimization passes
                ecma: 2020 // Modern JS for better minification
            },
            format: {
                comments: false // Remove all comments
            }
        },
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Group node_modules code
                    if (id.includes('node_modules')) {
                        // UI libraries
                        if (id.includes('bits-ui') || 
                            id.includes('svelte-sonner') || 
                            id.includes('tailwind-merge') || 
                            id.includes('tailwind-variants')) {
                            return 'vendor-ui';
                        }
                        
                        // Svelte related
                        if (id.includes('svelte')) {
                            return 'vendor-svelte';
                        }
                        
                        // Icons and visual elements
                        if (id.includes('lucide') || 
                            id.includes('embla-carousel')) {
                            return 'vendor-icons';
                        }
                        
                        // All other dependencies
                        return 'vendor';
                    }
                    
                    // Split application code
                    if (id.includes('$lib/components/ui')) {
                        return 'ui';
                    }
                }
            }
        },
        // Reduce initial load time
        cssCodeSplit: true,
        assetsInlineLimit: 4096, // Inline small assets (4kb or less)
        chunkSizeWarningLimit: 1000
    },
	plugins: [
        // Temporarily comment out Sentry plugins
        // sentryVitePlugin({
        //     org: "mssnoau",
        //     project: "mssnoau-frontend",
        //     // Auth tokens can be obtained from https://sentry.io/orgredirect/organizations/:orgslug/settings/auth-tokens/
        //     authToken: process.env.SENTRY_AUTH_TOKEN,
        // }),
        // sentrySvelteKit({
        //     autoUploadSourceMaps: true,
        //     adapter: "vercel",
        //     sourceMapsUploadOptions: {
        //         org: "mssnoau",
        //         project: "mssnoau-frontend"
        //     }
        // }),
        sveltekit(),
        ViteImageOptimizer({
        test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
        includePublic: true,
        logStats: true,
            cache: true,
            cacheLocation: "node_modules/.cache/.vite-plugin-image-optimizer",
        svg: {
            multipass: true,
            plugins: [
                {
                    name: 'preset-default',
                    params: {
                        overrides: {
                            cleanupNumericValues: false,
                                removeViewBox: false,
                                inlineStyles: false
                            }
                    },
                    }
            ],
        },
        png: {
                quality: 80,
                compressionLevel: 9
        },
        jpeg: {
                quality: 80,
                progressive: true
        },
        jpg: {
                quality: 80,
                progressive: true
            },
        webp: {
                lossless: false,
                quality: 85,
                effort: 6
        },
        avif: {
                lossless: false,
                quality: 80
            }
        })
    ]
});