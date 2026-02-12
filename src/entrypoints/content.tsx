import ReactDOM from 'react-dom/client';
import { useEffect, useState } from 'react';

import { useDomScanner } from '@/hooks/useDomScanner';
import { TextReplacer } from '@/components/TextReplacer';
import { isExtensionEnabled, authTokens } from '@/utils/storage';
import '@/assets/style.css';

function App() {
    const [enabled, setEnabled] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        isExtensionEnabled.getValue().then(setEnabled);
        authTokens.getValue().then((tokens) => setIsLoggedIn(!!tokens));

        const unwatchEnabled = isExtensionEnabled.watch(setEnabled);
        const unwatchAuth = authTokens.watch((tokens) => setIsLoggedIn(!!tokens));

        return () => {
            unwatchEnabled();
            unwatchAuth();
        };
    }, []);

    // Observer only runs when user is logged in AND global toggle is on
    const active = enabled && isLoggedIn;

    // useDomScanner returns targets and a reset function
    const { targets, reset } = useDomScanner(active);

    // Clear targets when extension is disabled to unmount TextReplacers
    // (which triggers their cleanup to restore original text)
    useEffect(() => {
        if (!active) reset();
    }, [active, reset]);

    return (
        <>
            {active && targets.map((t) => <TextReplacer key={t.uid} el={t.el} target={t.target} />)}
        </>
    );
}

export default defineContentScript({
    matches: ['*://open.spotify.com/*'],
    cssInjectionMode: 'manifest',

    main() {
        const root = document.createElement('div');
        root.id = 'utabridge-root';
        document.body.appendChild(root);
        ReactDOM.createRoot(root).render(<App />);
    },
});
