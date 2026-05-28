import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LocationObj, ContainerObj, ItemObj, DigitsCountObj, CategoriesObj, ItemSubmission, FullDataObj } from '@/constants/db-interface';

const API_BASE = "https://hollyngrade.com/rfid";

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
    categories: CategoriesObj[];   // type these properly once you use them
    digitCounts: DigitsCountObj[];
};

async function fetchInventory(): Promise<InventorySync> {
    const res = await fetch(API_BASE + '/api/inventory/sync');
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
}

export const useInventory = () => {
    return useQuery<FullDataObj>({
        queryKey: inventoryKeys.list(),
        queryFn: fetchInventory,
    });
}

/** add stuff */

export type InventoryPush = {
    data: ItemSubmission;
}

export const useAddToInventory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (itemData: ItemSubmission) => {
            const res = await fetch(API_BASE + '/api/inventory/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
            if (!res.ok) throw new Error (`HTTP ${res.status}`);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.list() })
        }
    });
}