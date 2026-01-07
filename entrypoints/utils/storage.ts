import type { PrimaryDisplay } from './types';

export const isExtensionEnabled = storage.defineItem<boolean>('local:isExtensionEnabled', {
    defaultValue: true,
});

export const primaryDisplay = storage.defineItem<PrimaryDisplay>('local:primaryDisplay', {
    defaultValue: 'romanization',
});
