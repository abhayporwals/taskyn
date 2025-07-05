class ApiResponse {
    constructor(statusCode, message = "Success", data = null){
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = true;
    } 
    static success(data = null, message = "Success") {
        return new ApiResponse(200, message, data);
    }
    static created(data = null, message = "Resource created successfully") {
        return new ApiResponse(201, message, data);
    }
    static noContent(message = "No content") {
        return new ApiResponse(204, message);
    }
}

export {ApiResponse};