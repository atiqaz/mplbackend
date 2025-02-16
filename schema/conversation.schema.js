import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId, // This references the 'User' model
        ref: "User", // Ensure 'User' model is defined and imported in the file
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    recieverId: {
        type: mongoose.Schema.Types.ObjectId, // This references the 'User' model
        ref: "User", // Ensure 'User' model is defined and imported in the file
        required: true,
    },
    senderName: {
        type: String,
        // required: true,
    },
    senderAvatar: {
        type: String,
        // required: true,
    },

}, {
    timestamps: true, // to track the message creation time (createdAt, updatedAt)
});

const conversations = mongoose.model('conversations', messageSchema);
export default conversations;
