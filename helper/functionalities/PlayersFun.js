import Players from '../../schema/player.schema.js'
import BidGround from '../../schema/bidding.schema.js'
import mongoose from 'mongoose';

const getPlayersWithAuctionId = async (auctionId) => {
    console.log(auctionId)
    const players = await Players.find({ auctions: auctionId }).populate("auctions");
    return players
}

const onSingleCurrentPlayer = async (auctionId, roomId) => {
    // Step 1: Find a player with this auctionId
    const players = await Players.aggregate([
        {
            $match: {
                "auctions.auctionId": new mongoose.Types.ObjectId(auctionId)
            }
        },
        {
            $lookup: {
                from: "biddinggrounds",
                localField: "_id",
                foreignField: "playerId",
                as: "biddingData"
            }
        }
    ]);

    if (!players.length) {
        console.log("No players found for this auction.");
        return null;
    }

    const player = players[0]; // You can implement logic to pick a random or next player too

    // Step 2: Check if this player exists in biddingground
    const existingBid = await BidGround.findOne({
        playerId: player._id,
        auctionId: auctionId
    }).populate("playerId");

    if (existingBid) {
        if (existingBid.status === "open") {
            console.log("Player already in biddingground and open.");
            return existingBid;
        } else {
            console.log("Player found in biddingground but status is not open.");
            return null;
        }
    }

    // Step 3: Not found in biddingground → insert
    const newBid = new BidGround({
        playerId: player._id,
        status: "open",
        bids: [],
        auctionId: auctionId,
        roomId: roomId || null, // in case you want to save roomId too
    });

    await newBid.save();
    const populated = await newBid.populate("playerId");
    console.log("Player inserted into biddingground.");
    return populated;
};


const updateBidHistory = async (data) => {
    const { playerId, bidderId, bidderName, bidAmount } = data;

    try {
        // Find the player and update in one operation for atomicity
        const updatedPlayer = await BidGround.findOneAndUpdate(
            { _id: playerId },
            { 
                $push: { 
                    bids: {
                        bidderId,
                        bidderName,
                        bidAmount,
                        bidTime: new Date(),
                        nextBidAmount: bidAmount + 1000, // Calculate based on current bid
                    }
                },
                $set: { currentBid: bidAmount } // Also update the current highest bid
            },
            { new: true } // Return the updated document
        );

        if (!updatedPlayer) {
            throw new Error('Player not found');
        }

        console.log('Bid successfully added:', updatedPlayer);
        return updatedPlayer;
    } catch (error) {
        console.error('Error updating bid history:', error);
        throw error; // Re-throw the error for the caller to handle
    }
};


export {
    getPlayersWithAuctionId,
    onSingleCurrentPlayer,
    updateBidHistory

}