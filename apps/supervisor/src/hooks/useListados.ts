import useSWR from 'swr';
import { swrFetcher, Listado } from '@/lib/api';

export function useListados() {
    const { data, error, isLoading, mutate } = useSWR<Listado[]>('/api/Import/listados', swrFetcher, {
        revalidateOnFocus: true,     
    });

    return {
        listados: data || [],
        isLoading,
        isError: error,
        mutate
    };
}
