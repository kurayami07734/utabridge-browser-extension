export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public code: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class InvalidTokenError extends ApiError {
    constructor(message: string = 'Invalid or expired token') {
        super(message, 401, 'UNAUTHORIZED');
        this.name = 'InvalidTokenError';
    }
}

export class RateLimitError extends ApiError {
    constructor(message: string = 'Rate limit exceeded') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
        this.name = 'RateLimitError';
    }
}

export class ValidationError extends ApiError {
    constructor(message: string) {
        super(message, 400, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}
