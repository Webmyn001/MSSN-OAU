import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/preline/preline.js'],

    theme: {
        extend: {
            colors: {
                'primary': {
                    '50': '#ecfff6',
                    '100': '#d3ffea',
                    '200': '#aaffd7',
                    '300': '#68ffb9',
                    '400': '#1fff92',
                    '500': '#00f473',
                    '600': '#00cc5b',
                    '700': '#009f4b',
                    '800': '#007c40',
                    '900': '#026d3b',
                    '950': '#003a1c',
                }
            },
            fontFamily: {
                primary: ['Merienda', 'serif'],
                secondary: ['Montserrat', 'sans-serif'],
                tertiary: ['Glegoo', 'sans-serif'],

            }

        }
    },

    plugins: [typography, forms, require('preline/plugin')]
};
