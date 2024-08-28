const UserActivity = require('../models/UserActivity'); // Assuming you have a UserActivity model
const jwt = require('jsonwebtoken');

const activityMiddleware = async (req, res, next) => {
    // Check if authToken is present in cookies
    if (!req.cookies.authToken) {
        console.error('No authToken found in cookies');
        return next();
    }

    // Attempt to extract user information from JWT token in cookies
    const token = req.cookies.authToken;
    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedPayload;
    } catch (error) {
        console.error('Error decoding JWT token:', error.message);
        return next();
    }

    // Extract user ID and action performed
    const userId = req.user.id;
    const action = `${req.method} ${req.url}`;

    // Save the user activity to the database
    try {
        await UserActivity.create({
            userId,
            action,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error saving user activity to database:', error);
    }

    next();
};

module.exports = activityMiddleware;
