export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  detail?: unknown;
}

export interface DashboardStats {
  total_users_registered: number;
  total_lots_created: number;
  total_completed_transactions: number;
}

export interface UploadResult {
  image_url?: string;
  url?: string;
  total_images?: number;
}
