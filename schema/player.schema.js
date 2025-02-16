import mongoose from "mongoose";
import JWT from 'jsonwebtoken';

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    age: {
        type: Number,
        required: true,
        min: 0,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, // Valid email format
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        match: /^[0-9]{10}$/, // Ensures a 10-digit phone number
    },
    password:{
        type: String,
        required: true,
        minlength: 6,
    },
    image: {
        type: String,
        trim: true,
        default: '', // Optional field
    },
    playerRole: {
        type: String,
        required: true,
        enum: ['Batsman', 'Bowler', 'Allrounder'], // Restricts values
    },
   
    battingDetails: {
        handedness: {
            type: String,  
        },
        battingOrder:{
            type: String,
          
        },
    },
    isWicketkeeper: {
        type: String,

    },
    bowlingDetails: {
        bowlingStyle: {
            type: String,
            
        },
       
    },
    basePrice: {
        type: Number,
        required: true,
        min: 1000,
    },
    auctionId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'auction'
    }
}, { timestamps: true });

playerSchema.methods.matchPassword = async function (enteredPassword) {
console.log({enteredPassword})
    return (enteredPassword === this.password); // Compare with hashed password
};

playerSchema.methods.getSignedJwtToken = function () {
    console.log(this)
    return JWT.sign({ _id: this._id, role: 'player' }, process.env.JWT_SECRET);
};
// const User = mongoose.model('user', UserSchema);
const Player = mongoose.model('Player', playerSchema);

export default Player;
