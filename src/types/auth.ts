export interface AuthTokens {
    authToken: string;
    refreshToken: string;
    expiresAt?: number;
}

export interface UserInfo {
    email: string;
    name?: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: UserInfo | null;
    isApiHealthy: boolean;
}

export interface ApiErrorResponse {
    error: string;
    message: string;
    status: number;
}
