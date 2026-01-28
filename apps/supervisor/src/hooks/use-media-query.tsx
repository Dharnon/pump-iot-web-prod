'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        setMatches(media.matches);

        const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
        media.addEventListener('change', listener);

        return () => media.removeEventListener('change', listener);
    }, [query]);

    return matches;
}

// Preset hooks for common breakpoints
export function useIsMobile(): boolean {
    return useMediaQuery('(max-width: 639px)');
}

export function useIsTablet(): boolean {
    return useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
}

export function useIsTabletPortrait(): boolean {
    return useMediaQuery('(max-width: 1023px) and (orientation: portrait)');
}

export function useIsTabletLandscape(): boolean {
    return useMediaQuery('(min-width: 640px) and (max-width: 1279px) and (orientation: landscape)');
}

export function useIsDesktop(): boolean {
    return useMediaQuery('(min-width: 1024px)');
}
