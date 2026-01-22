import { useCallback, useEffect, useState } from 'react';
import { AuthService } from '@/services/auth';
import { userInfo } from '@/utils/storage';
import type { UserInfo } from '@/types/auth';

export function useGoogleAuth() {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const isAuth = await AuthService.isAuthenticated();
            const storedUser = await userInfo.getValue();
            setIsSignedIn(isAuth);
            setCurrentUser(storedUser);
            setIsLoading(false);
        };
        init();
    }, []);

    const signIn = useCallback(async () => {
        try {
            const redirectUrl = browser.identity.getRedirectURL() || '';
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

            const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
            authUrl.searchParams.set('client_id', clientId);
            authUrl.searchParams.set('response_type', 'id_token');
            authUrl.searchParams.set('access_type', 'offline');
            authUrl.searchParams.set('redirect_uri', redirectUrl);
            authUrl.searchParams.set('scope', 'openid email profile');
            authUrl.searchParams.set('nonce', crypto.randomUUID());

            const responseUrl = await browser.identity.launchWebAuthFlow({
                url: authUrl.toString(),
                interactive: true,
            });

            if (!responseUrl) {
                throw new Error('No response URL received');
            }

            const url = new URL(responseUrl);
            const hashParams = new URLSearchParams(url.hash.slice(1));
            const idToken = hashParams.get('id_token');

            if (!idToken) {
                throw new Error('No ID token received');
            }

            const { user } = await AuthService.login(idToken);

            await userInfo.setValue(user);

            setIsSignedIn(true);
            setCurrentUser(user);
        } catch (e) {
            console.error('Sign in failed:', e);
            throw e;
        }
    }, []);

    const signOut = useCallback(async () => {
        await userInfo.setValue(null);
        setIsSignedIn(false);
        setCurrentUser(null);
    }, []);

    return { isSignedIn, currentUser, isLoading, signIn, signOut };
}
