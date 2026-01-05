export const fetchTranslation = async (text: string): Promise<string> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Current logic from SongReplacer:
    // "Static Romaji Title " + text
    // Also handles " • " logic, but usually that logic is client side?
    // The user said: "return the same static test as currently".
    // The current UI logic (SongReplacer) handles the " • " splitting.
    // Ideally, the API should return the *final* string, OR the UI handles formatting.
    // "this api call should be queued... once finished it should notify"
    // If the API returns the raw translation, the UI might still need to split.
    // But usually translation APIs handle the whole text.
    // Let's assume the API returns the "Romaji" version of the *whole* string or parts.

    // Replicating logic:
    const separator = ' • ';
    if (text.includes(separator)) {
        const parts = text.split(separator);
        const replacedParts = parts.map((part) => {
            // Check each part for CJK (simple check replication)
            if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(part)) {
                return `Static Romaji Title ${part}`;
            }
            return part;
        });
        return replacedParts.join(separator);
    }

    return `Static Romaji Title ${text}`;
};
