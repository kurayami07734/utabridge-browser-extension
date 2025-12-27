import { useEffect, useState } from 'react';
import { isExtensionEnabled } from '../utils/storage';

function App() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    isExtensionEnabled.getValue().then(setEnabled);
    return isExtensionEnabled.watch(setEnabled);
  }, []);

  const toggle = async () => {
    const next = !enabled;
    await isExtensionEnabled.setValue(next);
    setEnabled(next);
  };

  return (
    <div className="w-[200px] h-[200px] flex flex-col items-center justify-center bg-zinc-950 p-4 text-white">
      <div className="flex flex-col items-center gap-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-emerald-600 pb-1">
          UtaBridge
        </h1>
        <p className="text-xs text-zinc-400 text-center leading-snug">Translating your music world</p>
      </div>

      <button
        onClick={toggle}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-900 cursor-pointer
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
      <div className="mt-2 text-xs font-medium text-zinc-500">
        {enabled ? 'Active' : 'Disabled'}
      </div>
    </div>
  );
}

export default App;
