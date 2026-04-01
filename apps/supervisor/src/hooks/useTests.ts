import useSWR from 'swr';
import { swrFetcher, Test } from '@/lib/api';
import { MOCK_TESTS } from './mockTests';

export function useTests() {
    // MOCK MODE
    const isMock = typeof window !== 'undefined' && localStorage.getItem('USE_MOCK_DATA') === 'true';

    const { data, error, isLoading, mutate, isValidating } = useSWR<Test[]>(isMock ? null : '/api/tests', swrFetcher, {
        revalidateOnFocus: false,   // Prevents re-render corruption on window focus
        revalidateOnReconnect: true,
        dedupingInterval: 5000,     // Increased from 2000ms to reduce flicker
        keepPreviousData: true,     // Keep showing old data while revalidating
        fallbackData: [],
    });

    if (isMock) {
        return {
            tests: MOCK_TESTS,
            isLoading: false,
            isValidating: false,
            isError: null,
            mutate: () => Promise.resolve([] as any)
        };
    }

    return {
        tests: data || [],
        isLoading: isLoading,
        isValidating: isValidating,
        isError: error,
        mutate
    };
}
