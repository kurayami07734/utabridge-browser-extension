import { AuthService } from './auth';
import { InvalidTokenError, RateLimitError, ApiError } from '@/utils/errors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface LocalizeRequest {
    text: string;
    language: string; // Target language (e.g., 'en')
}

interface LocalizeResponse {
    translatedText: string;
    romanizedText: string;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const authToken = await AuthService.getAuthToken();
    if (!authToken) {
        throw new InvalidTokenError('No auth token available');
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
    });

    return response;
}

export async function fetchTranslation(
    text: string,
    language: string = 'en',
    maxRetries: number = 1
): Promise<LocalizeResponse> {
    const requestBody: LocalizeRequest = { text, language };

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        let response: Response;

        try {
            response = await fetchWithAuth(`${API_BASE_URL}/api/localize`, {
                method: 'POST',
                body: JSON.stringify(requestBody),
            });
        } catch (error) {
            if (attempt === maxRetries) throw error;
            continue;
        }

        if (response.ok) {
            return await response.json();
        }

        if (response.status === 401 && attempt < maxRetries) {
            const newTokens = await AuthService.refresh();
            if (!newTokens) {
                throw new InvalidTokenError('Refresh failed - please sign in again');
            }
            continue;
        }

        if (response.status === 429) {
            throw new RateLimitError('Too many requests');
        }

        if (response.status === 400) {
            const error = await response.json();
            throw new ApiError(error.message || 'Invalid request', 400, 'VALIDATION_ERROR');
        }

        const errorText = await response.text();
        throw new ApiError(errorText, response.status, 'API_ERROR');
    }

    throw new Error('Max retries exceeded');
}

export async function checkApiHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (!response.ok) return false;
        const data = await response.json();
        return data.health === 'ok' || data.health === 'UP';
    } catch {
        return false;
    }
}
