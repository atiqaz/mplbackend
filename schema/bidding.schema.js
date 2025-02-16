import mongoose from "mongoose";

const biddingGroundSchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Player document
      ref: "Player",
      required: true,
    },
    bids: [
      {
        bidderId: {
          type: mongoose.Schema.Types.ObjectId, // Reference to the User document
          ref: "user",
          required: true,
        },
        bidderName: {
          type: String,
          // required: true,
        },
        bidAmount: {
          type: Number,
          required: true,
        },
        bidTime: {
          type: Date,
          required: true,
        },
        nextBidAmount: {
          type: Number, // Calculated as `bidAmount + 1000`
        },
      },
    ],
    status: {
      type: String,
      default: 'open',
    },
    soldTo: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the User document
      ref: "user",
    }, 
    auctionId:{
      type: mongoose.Schema.Types.ObjectId, // Reference to the Room document
      ref: "auction",
      required: true,

    }

  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

const BiddingGround = mongoose.model("BiddingGround", biddingGroundSchema);
export default BiddingGround;
