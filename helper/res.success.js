class success {
    constructor(res, message) {
        this.res = res;  // Store the response object in the class
        this.message = message;  // Store the message
    }

    // Directly send the response
    static successResponse(res, data, message = 'Success') {
        return res.status(200).json({
            data,
            message,
            statusCode: 200,
            status: true
        });
    }

    static successCreatedResponse(res, data, message = 'Created') {
   
        return res.status(201).json({
            data,
            message,
            statusCode: 201,
            status: true

        });
    }
}

export default success;
