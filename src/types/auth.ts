export interface AuthTokens {
    authToken: string;
    refreshToken: string;
    expiresAt?: number;
}

export interface UserInfo {
    name: string;
    pictureUrl: string | null;
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
