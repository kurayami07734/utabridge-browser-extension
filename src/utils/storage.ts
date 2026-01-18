import type { AuthTokens, UserInfo } from '../types/auth';

export const isExtensionEnabled = storage.defineItem<boolean>('local:isExtensionEnabled', {
    defaultValue: true,
});

export const primaryDisplay = storage.defineItem<'romanization' | 'translation'>(
    'local:primaryDisplay',
    {
        defaultValue: 'romanization',
    }
);

export const authTokens = storage.defineItem<AuthTokens | null>('local:authTokens', {
    defaultValue: null,
});

export const userInfo = storage.defineItem<UserInfo | null>('local:userInfo', {
    defaultValue: null,
});

export const apiHealth = storage.defineItem<boolean>('local:apiHealth', {
    defaultValue: true,
});
