import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
    srcDir: 'src',
    modules: ['@wxt-dev/module-react'],
    manifest: () => ({
        name: 'UtaBridge',
        description: 'Seamlessly translate and romanize Japanese song titles on Spotify.',
        version: '0.1.0',
        short_name: 'UtaBridge',
        permissions: ['storage', 'identity'],
        oauth2: {
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scopes: ['openid', 'email', 'profile'],
        },
        host_permissions: ['*://open.spotify.com/*'],
        browser_specific_settings: {
            gecko: {
                id: 'adityaghidora+utabridge@gmail.com',
                strict_min_version: '109.0',
            },
        },
    }),
    vite: () => ({
        plugins: [tailwindcss()],
    }),
});
