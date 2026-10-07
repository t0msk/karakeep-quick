import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.tsx',
        './src/**/*.ts',
        './popup.html',
    ],
    theme: {
        extend: {},
    },
    corePlugins: {
        negativeMargins: true,
    },
    plugins: [],
};

export default config;
