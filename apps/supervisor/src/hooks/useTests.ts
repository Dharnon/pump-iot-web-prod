import useSWR from 'swr';
import { swrFetcher, Test } from '@/lib/api';

export function useTests() {
    const { data, error, isLoading, mutate } = useSWR<Test[]>('/api/tests', swrFetcher, {
        // Optimistic UI settings
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
    });

    return {
        tests: data || [],
        isLoading,
        isError: error,
        mutate
    };
}
