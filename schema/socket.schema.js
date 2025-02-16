import mongoose from "mongoose";

// Assuming there's a User model already defined
const socketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    socketId: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId, // This references the 'User' model
      ref: "user", // Ensure 'User' model is defined and imported in the file
      required: true, // Optional: make it required if every socket connection needs to be tied to a user
    },
    image: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const OnlineUser = mongoose.model("SocketUser", socketSchema);

export default OnlineUser;
