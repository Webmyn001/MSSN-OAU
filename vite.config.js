import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
    build: {
        sourcemap: true, // Source map generation must be turned on
    },
	plugins: [
        sentryVitePlugin({
            org: "mssnoau",
            project: "mssnoau-frontend",

            // Auth tokens can be obtained from https://sentry.io/orgredirect/organizations/:orgslug/settings/auth-tokens/
            authToken: process.env.SENTRY_AUTH_TOKEN,
        }),
        sentrySvelteKit({
            autoUploadSourceMaps: true,
            adapter: "vercel",
        sourceMapsUploadOptions: {
            org: "mssnoau",
            project: "mssnoau-frontend"
        }
    }),
        sveltekit(),
        ViteImageOptimizer({
        test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
        exclude: undefined,
        include: undefined,
        includePublic: true,
        logStats: true,
        ansiColors: true,
        svg: {
            multipass: true,
            plugins: [
                {
                    name: 'preset-default',
                    params: {
                        overrides: {
                            cleanupNumericValues: false,
                            removeViewBox: false, // https://github.com/svg/svgo/issues/1128
                        },
                        cleanupIDs: {
                            minify: false,
                            remove: false,
                        },
                        convertPathData: false,
                    },
                },
                'sortAttrs',
                {
                    name: 'addAttributesToSVGElement',
                    params: {
                        attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
                    },
                },
            ],
        },
        png: {
            // https://sharp.pixelplumbing.com/api-output#png
            quality: 100,
        },
        jpeg: {
            // https://sharp.pixelplumbing.com/api-output#jpeg
            quality: 100,
        },
        jpg: {
            // https://sharp.pixelplumbing.com/api-output#jpeg
            quality: 100,
        },
        tiff: {
            // https://sharp.pixelplumbing.com/api-output#tiff
            quality: 100,
        },
        // gif does not support lossless compression
        // https://sharp.pixelplumbing.com/api-output#gif
        gif: {},
        webp: {
            // https://sharp.pixelplumbing.com/api-output#webp
            lossless: true,
        },
        avif: {
            // https://sharp.pixelplumbing.com/api-output#avif
            lossless: true,
        },
        cache: false,
        cacheLocation: undefined,
    })]
});