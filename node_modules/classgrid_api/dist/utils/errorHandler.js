export class ApiError extends Error {
    statusCode;
    details;
    success;
    errors;
    constructor(statusCode, message = "Something went wrong", errors = [], details = null, stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.details = details;
        this.success = false;
        this.errors = errors;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
export class TokenExpiredApiError extends ApiError {
    constructor(type) {
        super(401, `Unauthorized: ${type} token expired.`);
    }
}
export const errorHandler = (err, req, res, next) => {
    let error = err;
    let _next = next;
    if (!(error instanceof ApiError)) {
        error = new ApiError(error.statusCode || 500, error.message || "Internal Server Error", error.errors || [], error.details || null, error.stack);
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
