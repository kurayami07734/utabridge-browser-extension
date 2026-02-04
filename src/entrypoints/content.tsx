import ReactDOM from 'react-dom/client';
import { useEffect, useState } from 'react';

import { useDomScanner } from '@/hooks/useDomScanner';
import { TextReplacer } from '@/components/TextReplacer';
import { isExtensionEnabled } from '@/utils/storage';
import '@/assets/style.css';

function App() {
    const [enabled, setEnabled] = useState(true);

    useEffect(() => {
        isExtensionEnabled.getValue().then(setEnabled);
        return isExtensionEnabled.watch(setEnabled);
    }, []);

    // useDomScanner returns targets and a reset function
    const { targets, reset } = useDomScanner(enabled);

    // Clear targets when extension is disabled to unmount TextReplacers
    // (which triggers their cleanup to restore original text)
    useEffect(() => {
        if (!enabled) reset();
    }, [enabled, reset]);

    return (
        <>
            {enabled &&
                targets.map((t) => <TextReplacer key={t.uid} el={t.el} target={t.target} />)}
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
