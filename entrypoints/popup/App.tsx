import { useEffect, useState } from 'react';
import { isExtensionEnabled, primaryDisplay } from '../utils/storage';
import type { PrimaryDisplay } from '../utils/types';

function App() {
    const [enabled, setEnabled] = useState(true);
    const [displayMode, setDisplayMode] = useState<PrimaryDisplay>('romanization');

    useEffect(() => {
        isExtensionEnabled.getValue().then(setEnabled);
        primaryDisplay.getValue().then(setDisplayMode);

        const unwatchEnabled = isExtensionEnabled.watch(setEnabled);
        const unwatchDisplay = primaryDisplay.watch(setDisplayMode);

        return () => {
            unwatchEnabled();
            unwatchDisplay();
        };
    }, []);

    const toggle = async () => {
        const next = !enabled;
        await isExtensionEnabled.setValue(next);
        setEnabled(next);
    };

    const setDisplay = async (mode: PrimaryDisplay) => {
        await primaryDisplay.setValue(mode);
        setDisplayMode(mode);
    };

    return (
        <div className="w-[220px] min-h-[240px] flex flex-col items-center bg-zinc-950 p-5 text-white">
            {/* Header */}
            <div className="flex flex-col items-center gap-1 mb-5">
                <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-emerald-600 pb-1">
                    UtaBridge
                </h1>
                <p className="text-xs text-zinc-400 text-center leading-snug">
                    Translating your music world
                </p>
            </div>

            {/* Enable Toggle */}
            <div className="flex flex-col items-center gap-2 mb-5">
                <button
                    onClick={toggle}
                    className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-900 cursor-pointer
                        ${enabled ? 'bg-green-500' : 'bg-zinc-700'}
                    `}
                >
                    <span className="sr-only">Enable Translation</span>
                    <span
                        className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${enabled ? 'translate-x-6' : 'translate-x-1'}
                        `}
                    />
                </button>
                <div className="text-xs font-medium text-zinc-500">
                    {enabled ? 'Active' : 'Disabled'}
                </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-zinc-800 mb-4" />

            {/* Primary Display Setting */}
            <div className="w-full flex flex-col items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Show as Primary</span>
                <div className="flex rounded-lg overflow-hidden border border-zinc-700">
                    <button
                        onClick={() => setDisplay('romanization')}
                        className={`
                            px-3 py-1.5 text-xs font-medium transition-all cursor-pointer
                            ${
                                displayMode === 'romanization'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                            }
                        `}
                    >
                        Romaji
                    </button>
                    <button
                        onClick={() => setDisplay('translation')}
                        className={`
                            px-3 py-1.5 text-xs font-medium transition-all cursor-pointer border-l border-zinc-700
                            ${
                                displayMode === 'translation'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                            }
                        `}
                    >
                        Translation
                    </button>
                </div>
                <p className="text-[10px] text-zinc-500 text-center mt-1">
                    Hover for {displayMode === 'romanization' ? 'translation' : 'romanization'}
                </p>
            </div>
        </div>
    );
}

export default App;
