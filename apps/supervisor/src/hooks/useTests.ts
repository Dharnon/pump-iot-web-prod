import useSWR from 'swr';
import { swrFetcher, Test } from '@/lib/api';
import { MOCK_TESTS } from './mockTests';

export function useTests() {
    // MOCK MODE
    const isMock = typeof window !== 'undefined' && localStorage.getItem('USE_MOCK_DATA') === 'true';

    const { data, error, isLoading, mutate } = useSWR<Test[]>(isMock ? null : '/api/tests', swrFetcher, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
    });

    if (isMock) {
        return {
            tests: MOCK_TESTS,
            isLoading: false,
            isError: null,
            mutate: () => Promise.resolve([] as any)
        };
    }

    return {
        tests: data || [],
        isLoading: isLoading,
        isError: error,
        mutate
    };
}
