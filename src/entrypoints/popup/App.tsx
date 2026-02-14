import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { isExtensionEnabled, primaryDisplay, apiHealth, userInfo } from '@/utils/storage';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { updatePreferences } from '@/services/api';
import type { PrimaryDisplay } from '@/utils/types';
import { LoginPage } from './components/LoginPage';
import { ServerDownPage } from './components/ServerDownPage';
import { HomePage } from './components/HomePage';
import { SettingsPage } from './components/SettingsPage';
import { NEON_PINK } from './theme';

type View = 'home' | 'settings';

function App() {
    const { isSignedIn, currentUser, isLoading, signIn, signOut } = useGoogleAuth();
    const [enabled, setEnabled] = useState(true);
    const [displayMode, setDisplayMode] = useState<PrimaryDisplay>('romanization');
    const [isApiHealthy, setIsApiHealthy] = useState(true);
    const [currentView, setCurrentView] = useState<View>('home');

    useEffect(() => {
        isExtensionEnabled.getValue().then(setEnabled);
        primaryDisplay.getValue().then(setDisplayMode);
        apiHealth.getValue().then(setIsApiHealthy);

        const unwatchEnabled = isExtensionEnabled.watch(setEnabled);
        const unwatchDisplay = primaryDisplay.watch(setDisplayMode);
        const unwatchHealth = apiHealth.watch(setIsApiHealthy);

        return () => {
            unwatchEnabled();
            unwatchDisplay();
            unwatchHealth();
        };
    }, []);

    const toggle = async () => {
        const next = !enabled;
        await isExtensionEnabled.setValue(next);
        setEnabled(next);
    };

    const setDisplay = async (mode: PrimaryDisplay) => {
        // Optimistic local update
        await primaryDisplay.setValue(mode);
        setDisplayMode(mode);

        if (currentUser?.id) {
            try {
                const updated = await updatePreferences(currentUser.id, mode);
                // Sync from server response
                const serverMode =
                    updated.preferences.PRIMARY_TEXT_TYPE === 'ROMANIZATION'
                        ? 'romanization'
                        : 'translation';
                await primaryDisplay.setValue(serverMode as PrimaryDisplay);
                setDisplayMode(serverMode as PrimaryDisplay);
                await userInfo.setValue({
                    id: updated.id,
                    name: updated.name,
                    email: updated.email,
                    pictureUrl: updated.pictureUrl,
                });
            } catch (err) {
                console.error('[App] Failed to sync preference to server:', err);
            }
        }
    };

    const handleSignOut = async () => {
        await signOut();
        setCurrentView('home');
    };

    // Loading state
    if (isLoading) {
        return (
            <Box
                sx={{
                    width: 320,
                    minHeight: 260,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'background.default',
                }}
            >
                <CircularProgress size={28} sx={{ color: NEON_PINK }} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width: 320,
                minHeight: 260,
                backgroundColor: 'background.default',
                overflow: 'hidden',
            }}
        >
            {/* API is down → Server down page (regardless of auth) */}
            {!isApiHealthy ? (
                <ServerDownPage />
            ) : /* Not signed in → Login page */
            !isSignedIn || !currentUser ? (
                <LoginPage onSignIn={signIn} />
            ) : /* Signed in & healthy → Home or Settings */
            currentView === 'settings' ? (
                <SettingsPage
                    user={currentUser}
                    displayMode={displayMode}
                    onDisplayChange={setDisplay}
                    onBack={() => setCurrentView('home')}
                    onSignOut={handleSignOut}
                />
            ) : (
                <HomePage
                    user={currentUser}
                    enabled={enabled}
                    onToggle={toggle}
                    onAvatarClick={() => setCurrentView('settings')}
                />
            )}
        </Box>
    );
}

export default App;
