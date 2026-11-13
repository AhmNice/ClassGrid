export interface RequestResponse<T> {
  success: boolean;
  message: string;
  data?: T | null;
  errors?: Array<{ field: string; message: string }>;
}
