import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // This references the 'User' model
        ref: "User", // Ensure 'User' model is defined and imported in the file
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    senderName: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        // required: true,
    },
    socketId: {
        type: String,
        // required: true,
    },
}, {
    timestamps: true, // to track the message creation time (createdAt, updatedAt)
});

const groupMesages = mongoose.model('GroupMessage', messageSchema);
export default groupMesages;
