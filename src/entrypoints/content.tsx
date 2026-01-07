import ReactDOM from 'react-dom/client';
import { useEffect, useState } from 'react';

import { useDomObserver } from '@/hooks/useDomObserver';
import { SongReplacer } from '@/components/SongReplacer';
import { isExtensionEnabled } from '@/utils/storage';
import '@/assets/style.css';

const ContentApp = () => {
    const [enabled, setEnabled] = useState(true);

    useEffect(() => {
        isExtensionEnabled.getValue().then(setEnabled);
        return isExtensionEnabled.watch(setEnabled);
    }, []);

    const targets = useDomObserver(enabled);
    return (
        <>
            {targets.map((target) => (
                <SongReplacer
                    key={target.id}
                    originalElement={target.originalElement}
                    strategy={target.strategy}
                />
            ))}
        </>
    );
};

export default defineContentScript({
    matches: ['*://open.spotify.com/*'],
    cssInjectionMode: 'manifest',

    main(_ctx) {
        const appRoot = document.createElement('div');
        appRoot.id = 'utabridge-orchestrator';
        document.body.appendChild(appRoot);

        ReactDOM.createRoot(appRoot).render(<ContentApp />);
    },
});
