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