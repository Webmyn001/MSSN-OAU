import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
// Temporarily comment out ViteImageOptimizer
// import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
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
        // Disable chunking to avoid initialization order issues
        rollupOptions: {
            output: {
                manualChunks: () => 'app' // Put everything in one chunk
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
        // Temporarily comment out ViteImageOptimizer
        /*
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
        */
    ]
});