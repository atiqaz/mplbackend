import mongoose from "mongoose";

const AuctionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        auctionDate: {
            type: Date,
            required: true,

        },
        status: {
            type: String,
            enum: ['Pending', 'InProgress', 'Completed'],
            default: 'Pending'
        },
        roomId:{
          
            type: String,
            required: true
        }


    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    }
);

const AuctionModel = mongoose.model("auction", AuctionSchema);
export default AuctionModel;
