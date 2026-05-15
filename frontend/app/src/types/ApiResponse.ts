export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  results?: T[];
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
