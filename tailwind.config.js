import {fontFamily} from "tailwindcss/defaultTheme";
import tailwindcssAnimate from "tailwindcss-animate";
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import preline from 'preline/plugin';
import lineclamp from '@tailwindcss/line-clamp';

/** @type {import('tailwindcss').Config} */
const config = {
    darkMode: ["class"],
    content: ["./src/**/*.{html,js,svelte,ts}"],
    safelist: ["dark"],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px"
            }
        },
        extend: {
            colors: {
                border: "hsl(var(--border) / <alpha-value>)",
                input: "hsl(var(--input) / <alpha-value>)",
                ring: "hsl(var(--ring) / <alpha-value>)",
                background: "hsl(var(--background) / <alpha-value>)",
                foreground: "hsl(var(--foreground) / <alpha-value>)",
                primary: {
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
                    DEFAULT: "hsl(var(--primary) / <alpha-value>)",
                    foreground: "hsl(var(--primary-foreground) / <alpha-value>)"
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
                    foreground: "hsl(var(--secondary-foreground) / <alpha-value>)"
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
                    foreground: "hsl(var(--destructive-foreground) / <alpha-value>)"
                },
                muted: {
                    DEFAULT: "hsl(var(--muted) / <alpha-value>)",
                    foreground: "hsl(var(--muted-foreground) / <alpha-value>)"
                },
                accent: {
                    DEFAULT: "hsl(var(--accent) / <alpha-value>)",
                    foreground: "hsl(var(--accent-foreground) / <alpha-value>)"
                },
                popover: {
                    DEFAULT: "hsl(var(--popover) / <alpha-value>)",
                    foreground: "hsl(var(--popover-foreground) / <alpha-value>)"
                },
                card: {
                    DEFAULT: "hsl(var(--card) / <alpha-value>)",
                    foreground: "hsl(var(--card-foreground) / <alpha-value>)"
                },
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background))",
                    foreground: "hsl(var(--sidebar-foreground))",
                    primary: "hsl(var(--sidebar-primary))",
                    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
                    accent: "hsl(var(--sidebar-accent))",
                    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
                    border: "hsl(var(--sidebar-border))",
                    ring: "hsl(var(--sidebar-ring))",
                },
            },
            borderRadius: {
                xl: "calc(var(--radius) + 4px)",
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)"
            },
            fontFamily: {
                primary: ['Merienda', 'serif'],
                secondary: ['Montserrat', 'sans-serif'],
                tertiary: ['Glegoo', 'sans-serif']
            },
            keyframes: {
                "accordion-down": {
                    from: {height: "0"},
                    to: {height: "var(--bits-accordion-content-height)"},
                },
                "accordion-up": {
                    from: {height: "var(--bits-accordion-content-height)"},
                    to: {height: "0"},
                },
                "caret-blink": {
                    "0%,70%,100%": {opacity: "1"},
                    "20%,50%": {opacity: "0"},
                },
                background: {
                    '0%, 100%': {backgroundPosition: '0% 50%'},
                    '50%': {backgroundPosition: '100% 50%'},
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "caret-blink": "caret-blink 1.25s ease-out infinite",
                border: 'background ease infinite',
            },
        },
    },
    plugins: [typography, forms, preline, tailwindcssAnimate, lineclamp]
};

export default config;