import React from 'react';
import ReactDOM from 'react-dom/client';
import { defineContentScript } from 'wxt/sandbox';
import { useDomObserver } from './hooks/useDomObserver';
import { SongReplacer } from '../components/SongReplacer';
import '../assets/style.css';

const ContentApp = () => {
    const targets = useDomObserver();
    return (
        <>
            {targets.map(target => (
                <SongReplacer
                    key={target.id}
                    mountNode={target.mountNode}
                    originalElement={target.originalElement}
                />
            ))}
        </>
    );
};

export default defineContentScript({
    matches: ['*://open.spotify.com/*'],
    cssInjectionMode: 'manifest',

    main(ctx) {
        const appRoot = document.createElement('div');
        appRoot.id = 'utabridge-orchestrator';
        document.body.appendChild(appRoot);

        ReactDOM.createRoot(appRoot).render(<ContentApp />);
    }
});
