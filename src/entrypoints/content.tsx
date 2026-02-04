import ReactDOM from 'react-dom/client';
import { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { useDomScanner } from '@/hooks/useDomScanner';
import { TextReplacer } from '@/components/TextReplacer';
import { isExtensionEnabled } from '@/utils/storage';
import '@/assets/style.css';

const darkTheme = createTheme({ palette: { mode: 'dark' } });

function App() {
    const [enabled, setEnabled] = useState(true);

    useEffect(() => {
        isExtensionEnabled.getValue().then(setEnabled);
        return isExtensionEnabled.watch(setEnabled);
    }, []);

    const targets = useDomScanner(enabled);

    return (
        <ThemeProvider theme={darkTheme}>
            {targets.map((t) => (
                <TextReplacer key={t.uid} el={t.el} target={t.target} />
            ))}
        </ThemeProvider>
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
