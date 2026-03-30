export interface ApiSuccess<T> {
  data: T;
  error?: never;
}

export interface ApiError {
  data?: never;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
