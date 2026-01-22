import { useEffect, useState } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { apiHealth } from '@/utils/storage';

export function AuthButton() {
    const { isSignedIn, currentUser, isLoading, signIn, signOut } = useGoogleAuth();
    const [isApiHealthy, setIsApiHealthy] = useState(true);

    useEffect(() => {
        apiHealth.getValue().then(setIsApiHealthy);
        const unwatch = apiHealth.watch(setIsApiHealthy);
        return unwatch;
    }, []);

    if (isLoading) {
        return <div className="text-xs text-zinc-500">Loading...</div>;
    }

    if (!isApiHealthy) {
        return (
            <div className="flex flex-col items-center gap-2 p-3 bg-zinc-900 rounded-lg">
                <span className="text-xs text-amber-500">API Unavailable</span>
                <span className="text-[10px] text-zinc-500">Showing cached translations only</span>
            </div>
        );
    }

    if (isSignedIn && currentUser) {
        return (
            <div className="flex flex-col items-center gap-2 w-full">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span>{currentUser.name}</span>
                </div>
                <button
                    onClick={signOut}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    Sign Out
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={signIn}
                className="
                    px-4 py-2 text-xs font-medium text-white rounded-lg
                    bg-green-600 hover:bg-green-500 transition-colors
                "
            >
                Sign in with Google
            </button>
            <span className="text-[10px] text-zinc-500 text-center">Required for translation</span>
        </div>
    );
}
