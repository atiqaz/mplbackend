import mongoose from "mongoose";
import JWT from 'jsonwebtoken';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    phone: {
        type: String,
        required: true,
        trim: true,
        match: /^[0-9]{10}$/, // Ensures a 10-digit phone number
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, // Valid email format
    },
    image: {
        type: String,
        trim: true,
        default: '', // Optional field
    },
    password: {
        type: String,
        required: true,
        minlength: 8, // Minimum password length
    },
    role: {
        type: String,
        enum: ['admin', 'organisation', 'player'], // Restricts values
        default: 'user',
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'accepted', 'rejected'] // Restricts values
    },
    totalPurse:{
        type:Number
    },
    remainingPurse :{
        type:Number
    },
    auctionId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'auction'
    }

}, { timestamps: true });



UserSchema.methods.matchPassword = async function (enteredPassword) {

    return (enteredPassword === this.password); // Compare with hashed password
};

UserSchema.methods.getSignedJwtToken = function () {
    console.log(this)
    return JWT.sign({ _id: this._id, role: this.role }, process.env.JWT_SECRET);
};
const User = mongoose.model('user', UserSchema);

export default User;


