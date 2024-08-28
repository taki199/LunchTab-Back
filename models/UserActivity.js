const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    action: String,
    timestamp: Date
});

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity;