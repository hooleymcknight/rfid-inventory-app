// ---------------

export interface FullDataObj {
    locations: Array<LocationObj>;
    categories: Array<CategoriesObj>;
    containers: Array<ContainerObj>;
    items: Array<ItemObj>;
    digitCounts: Array<DigitsCountObj>;
}

export interface LocationObj {
  location_id: number;
  location_name: string;
}

export interface ContainerObj {
  storage_id: number;
  container: string;
  location_id: number;
  category_id: number;
}

export interface ItemObj {
    item_id: number;
    item: string;
    description: string | null;
    storage_id: number;
}

export interface DigitsCountObj {
    sort_order: number;
    database_name: string;
    digit_count: number;
}

export interface CategoriesObj {
    category_id: number;
    category: string;
}

export interface MappedId {
    db: string;
    field: string;
    value: string;
}

export interface ItemSubmission {
    item: string;
    description: string | null;
    storage_id: number;
}

export interface ItemUpdate {
    item_id: number;
    item?: string;
    description?: string | null;
    storage_id?: number;
}

export type slSchema = { location_id: number; location_name: string; containers: ContainerObj[]; };