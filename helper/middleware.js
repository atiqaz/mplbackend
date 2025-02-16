import error from "./res.error.js";
import JWT from "jsonwebtoken";

const validateToken = async (req, res, next) => {
    // Implement token validation logic here
    // For example, check if the token is present and valid in a database or a JWT middleware
    const auth = req.headers['authorization'];
    if (!auth) {
        return error.BadRequest(res, 'Token is required')
    }
    if (auth) {
        const token = auth.split(' ')[1];
        // Validate token using a JWT library or a custom method
        try {
            const decodedToken = JWT.verify(token, process.env.JWT_SECRET);
            req.user = decodedToken;
            next();
        } catch (err) {
            return error.Unauthorized(res, 'Invalid token')
        }
    }

}

export { validateToken }