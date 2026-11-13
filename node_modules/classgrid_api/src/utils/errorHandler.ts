import { TokenType } from "@/types/general.js";
import { NextFunction, Request, Response } from "express";

/** One problem with one input. The frontend shows it under that input. */
export type FieldError = {
  field: string;
  message: string;
};

export class ApiError extends Error {
  public statusCode: number;
  public details?: any;
  public success: boolean;
  public errors: FieldError[];

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: FieldError[] = [],
    details: any = null,
    stack: string = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.details = details;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export class TokenExpiredApiError extends ApiError {
  constructor(type: TokenType) {
    super(401, `Unauthorized: ${type} token expired.`);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = err;
  let _next = next;
  if (!(error instanceof ApiError)) {
    error = new ApiError(
      error.statusCode || 500,
      error.message || "Internal Server Error",
      error.errors || [],
      error.details || null,
      error.stack,
    );
  }

  const response = {
    message: error.message,
    success: false,
    statusCode: error.statusCode,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  return res.status(error.statusCode || 500).json(response);
};
