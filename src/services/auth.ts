import { authTokens, userInfo } from '@/utils/storage';
import type { AuthTokens } from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export class AuthService {
    static async login(googleToken: string): Promise<AuthTokens> {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: googleToken }),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        const tokens: AuthTokens = {
            authToken: data.authToken,
            refreshToken: data.refreshToken,
        };

        await authTokens.setValue(tokens);
        return tokens;
    }

    static async refresh(): Promise<AuthTokens | null> {
        const current = await authTokens.getValue();
        if (!current?.refreshToken) return null;

        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: current.refreshToken }),
        });

        if (!response.ok) {
            await this.logout();
            return null;
        }

        const data = await response.json();
        const newTokens: AuthTokens = {
            authToken: data.authToken,
            refreshToken: data.refreshToken,
        };

        await authTokens.setValue(newTokens);
        return newTokens;
    }

    static async logout(): Promise<void> {
        await authTokens.setValue(null);
        await userInfo.setValue(null);
    }

    static async getAuthToken(): Promise<string | null> {
        const tokens = await authTokens.getValue();
        return tokens?.authToken || null;
    }

    static async isAuthenticated(): Promise<boolean> {
        const token = await this.getAuthToken();
        return !!token;
    }
}
