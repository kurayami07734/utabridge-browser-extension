import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
    srcDir: 'src',
    modules: ['@wxt-dev/module-react'],
    manifest: {
        name: 'UtaBridge',
        description: 'Seamlessly translate and romanize Japanese song titles on Spotify.',
        version: '0.1.0',
        short_name: 'UtaBridge',
        key: import.meta.env.VITE_EXTENSION_PUBLIC_KEY,
        permissions: ['storage', 'identity'],
        host_permissions: ['*://open.spotify.com/*'],
        browser_specific_settings: {
            gecko: {
                id: 'adityaghidora+utabridge@gmail.com',
                strict_min_version: '109.0',
            },
        },
    },
    vite: () => ({
        plugins: [tailwindcss()],
    }),
});
