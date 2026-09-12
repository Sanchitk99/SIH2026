export interface MaterialLot {
  id: string;
  lot_reference?: string;
  collector_id?: string;
  material_category_id?: string;
  material_category_name?: string;
  material_description?: string;
  approximate_weight?: number;
  weight_kg?: number;
  weight_unit?: string;
  condition?: string;
  collection_location?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Quote {
  id: string;
  lot_id: string;
  recycler_id?: string;
  quoted_price?: number;
  price_per_unit?: number;
  pickup_available?: boolean;
  estimated_pickup_date?: string;
  status?: string;
}

export interface Transaction {
  id: string;
  lot_id: string;
  collector_id?: string;
  recycler_id?: string;
  quote_id?: string;
  transaction_status?: string;
  payment_status?: string;
  final_weight?: number;
  final_price?: number;
  material_category_name?: string;
  material_description?: string;
  approximate_weight?: number;
  weight_unit?: string;
  condition?: string;
  quoted_price?: number;
  pickup_available?: boolean;
  estimated_pickup_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RecyclerRecord {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  facility_name?: string;
  facility_address?: string;
  city?: string;
  state?: string;
  authorization_status?: string;
  authorization_number?: string;
}
