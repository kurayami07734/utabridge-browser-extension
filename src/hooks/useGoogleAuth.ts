import { useCallback, useEffect, useState } from 'react';
import { AuthService } from '@/services/auth';
import { userInfo } from '@/utils/storage';
import type { UserInfo } from '@/types/auth';

interface IdentityTokenResult {
    token: string;
}

interface IdentityTokenArray {
    token: string;
}

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
            const tokenResponse = await (
                browser.identity as unknown as {
                    getAuthToken(options: { interactive: boolean }): Promise<IdentityTokenResult>;
                }
            ).getAuthToken({ interactive: true });
            const googleToken = tokenResponse.token;

            await AuthService.login(googleToken);

            const userInfoResponse = await fetch(
                `https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${googleToken}`
            );
            const googleUser = await userInfoResponse.json();

            const user: UserInfo = {
                email: googleUser.email,
                name: googleUser.name,
            };
            await userInfo.setValue(user);

            setIsSignedIn(true);
            setCurrentUser(user);
        } catch (e) {
            console.error('Sign in failed:', e);
            throw e;
        }
    }, []);

    const signOut = useCallback(async () => {
        const identityApi = browser.identity as unknown as {
            getAuthToken(options: object): Promise<IdentityTokenArray[]>;
            removeCachedAuthToken(options: { token: string }): Promise<void>;
        };
        const tokens = await identityApi.getAuthToken({});
        if (tokens.length > 0) {
            await identityApi.removeCachedAuthToken({ token: tokens[0].token });
        }
        await AuthService.logout();
        setIsSignedIn(false);
        setCurrentUser(null);
    }, []);

    return { isSignedIn, currentUser, isLoading, signIn, signOut };
}
