class error {
    constructor(res, message) {
        this.res = res;  // Store the response object
        this.message = message;  // Store the message
    }

    // Method to handle Bad Request error
    static BadRequest(res, message) {
        console.log({ message });  // For debugging
        return res.status(400).json({
            message,
            statusCode: 400,
            type: 'Bad Request',
            status: false,
        });
    }

    // Method to handle Unauthorized error
    static Unauthorized(res, message) {
        console.log({ message });  // For debugging
        return res.status(401).json({
            message,
            statusCode: 401,
            type: 'Unauthorized',
            status: false,
        });
    }

    // Method to handle Internal Server Error
    static InternalServerError(res, message) {
        console.log({ message });  // For debugging
        return res.status(500).json({
            message,
            statusCode: 500,
            type: 'Internal Server Error',
            status: false,
        });
    }
    static NOT_FOUND(res, message) {
        console.log({ message });  // For debugging
        return res.status(404).json({
            message,
            statusCode: 404,
            type: 'NOT FOUND',
            status: false,
        });
    }
    static CONFLICTS(res, message) {
        console.log({ message });  // For debugging
        return res.status(409).json({
            message,
            statusCode: 409,
            type: 'CONFLICTS',
            status: false,
        });
    }
}

export default error;
