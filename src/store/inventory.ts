import { useQuery } from '@tanstack/react-query';
import { LocationObj, ContainerObj, ItemObj } from '@/constants/db-interface';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE as string;

export const inventoryKeys = {
    all: ['inventory'] as const,
    list: () => [...inventoryKeys.all, 'list'] as const,
};

// Shape of the /sync response — defining this means the rest of your
// app stops guessing what `data.containers` is.
export type InventorySync = {
    locations: LocationObj[];
    containers: ContainerObj[];
    items: ItemObj[];
    categories: unknown[];   // type these properly once you use them
    digitCounts: unknown[];
};

async function fetchInventory(): Promise<InventorySync> {
    const res = await fetch(API_BASE + '/api/inventory/sync');
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
}

export const useInventory = () => {
    return useQuery({
        queryKey: inventoryKeys.list(),
        queryFn: fetchInventory,
    });
}
