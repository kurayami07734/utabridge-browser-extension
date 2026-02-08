import { defineConfig, UserManifest } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
    srcDir: 'src',
    modules: ['@wxt-dev/module-react'],
    manifest: ({ browser }) => {
        const config: UserManifest = {
            name: 'UtaBridge',
            description: 'Seamlessly translate and romanize Japanese song titles on Spotify.',
            version: '0.1.0',
            short_name: 'UtaBridge',
            permissions: ['storage'],
            host_permissions: ['https://open.spotify.com/*'],
        };

        if (browser === 'chrome') {
            config.oauth2 = {
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                scopes: ['openid', 'email', 'profile'],
            };
        } else if (browser === 'firefox') {
            config.browser_specific_settings = {
                gecko: {
                    id: 'adityaghidora+utabridge@gmail.com',
                    strict_min_version: '109.0',
                },
            };
        }

        return config;
    },
    vite: () => ({
        plugins: [tailwindcss()],
    }),
});
