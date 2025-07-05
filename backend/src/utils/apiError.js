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
        return new Error(400, message, errors);
    }
    static unauthorized(message = "Unauthorized") {
        return new Error(401, message);
    }
    static forbidden(message = "Forbidden") {
        return new Error(403, message);
    }
    static notFound(message = "Not Found") {
        return new Error(404, message);
    }
    static conflict(message = "Conflict") {
        return new Error(409, message);
    }
    static internalServerError(message = "Internal Server Error", errors = []) {
        return new Error(500, message, errors);
    }
    static customError(statusCode, message = "Custom Error", errors = []) {
        return new Error(statusCode, message, errors);
    }
}

export {ApiError};