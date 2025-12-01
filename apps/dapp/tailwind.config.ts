import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class'],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: '#1055C9',
                    foreground: '#FFFFFF',
                },
                secondary: {
                    DEFAULT: '#f4f3f0',
                    foreground: '#000000',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: '#f4f3f0',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: '#1055C9',
                    foreground: '#FFFFFF',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                brand: {
                    neutral: '#f4f3f0',
                    black: '#000000',
                    white: '#FFFFFF',
                    blue: '#1055C9',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #1055C9 0%, #000000 100%)',
                'gradient-secondary': 'linear-gradient(135deg, #f4f3f0 0%, #FFFFFF 100%)',
                'gradient-accent': 'linear-gradient(135deg, #1055C9 0%, #f4f3f0 100%)',
                'gradient-radial': 'radial-gradient(circle, #1055C9 0%, #000000 100%)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
};

export default config;
