import { useEffect, useState } from 'react';
import { primaryDisplay } from '@/utils/storage';
import type { PrimaryDisplay } from '@/utils/types';

/**
 * Hook to watch and return the user's display preference (romanization or translation).
 */
export function useDisplayPreference(): PrimaryDisplay {
    const [displayPref, setDisplayPref] = useState<PrimaryDisplay>('romanization');

    useEffect(() => {
        primaryDisplay.getValue().then(setDisplayPref);
        return primaryDisplay.watch(setDisplayPref);
    }, []);

    return displayPref;
}
