class ApiError extends Error {
    constructor(
        statusCode,
        message = "Internal Server Error",
        errors = [],
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.data = null;
        this.success = false;

        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message, errors = []) {
        return new ApiError(400, message, errors);
    }
    static unauthorized(message = "Unauthorized") {
        return new ApiError(401, message);
    }
    static forbidden(message = "Forbidden") {
        return new ApiError(403, message);
    }
    static notFound(message = "Not Found") {
        return new ApiError(404, message);
    }
    static conflict(message = "Conflict") {
        return new ApiError(409, message);
    }
    static internalServerError(message = "Internal Server Error", errors = []) {
        return new ApiError(500, message, errors);
    }
    static customError(statusCode, message = "Custom Error", errors = []) {
        return new ApiError(statusCode, message, errors);
    }
}

export {ApiError};