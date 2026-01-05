export const isExtensionEnabled = storage.defineItem<boolean>('local:isExtensionEnabled', {
    defaultValue: true,
});
