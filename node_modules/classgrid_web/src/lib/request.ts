import { type AxiosResponse } from "axios";
import toast from "react-hot-toast";
import type { UserDTO } from "../interface/user.dto";


type ApiResponse<T = unknown> = {
  user: UserDTO | null;
  success: boolean;
  message?: string;
  data?: T;
  result?:T;
  errors?: errorResponse;
};
export type errorResponse = {
  field: string;
  message: string;
}[];
export type ApiError = {
  message?: string;
  response?: {
    data?: {
      message?: string;
      errors?: errorResponse;
    };
  };
};

type HandleRequestParams<T> = {
  request: () => Promise<AxiosResponse<ApiResponse<T>>>;
  onSuccess?: (data: ApiResponse<T>) => void;
  onError?: (error: ApiError) => void;
  showToast?: boolean;
};

type HandleRequestResult<T> =
  | { success: true; data: ApiResponse<T> }
  | { success: false; errors?: errorResponse };

export const handleRequest = async <T = unknown>({
  request,
  onSuccess,
  onError,
  showToast = true,
}: HandleRequestParams<T>): Promise<HandleRequestResult<T>> => {
  try {
    const { data } = await request();
    if (!data.success) {
      if (showToast) toast.error(data.message || "something went wrong");
      onError?.(data);
      return { success: false, errors: data.errors };
    }
    if (showToast) toast.success(data.message || "Success");
    onSuccess?.(data);
    return { success: true, data };
  } catch (error: unknown) {
    const err = error as ApiError;
    console.log(error)
    const errMsg =
      err?.response?.data?.message ||
      "Network error. Please check your connection.";
    if (showToast) toast.error(errMsg);

    onError?.(err);

    return { success: false, errors: err?.response?.data?.errors };
  }
};
