import Players from '../../schema/player.schema.js'
import BidGround from '../../schema/bidding.schema.js'
import mongoose from 'mongoose';

const getPlayersWithAuctionId = async (auctionId) => {
    console.log(auctionId)
    const players = await Players.find({ auctions: auctionId }).populate("auctions");
    return players
}

const onSingleCurrentPlayer = async (auctionId, roomId) => {
    
    // Step 1: Find all players for this auction
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

    // Step 2: Check each player in order
    for (const player of players) {
        // Find existing bid for this player in this auction
        const existingBid = await BidGround.findOne({
            playerId: player._id,
            auctionId: auctionId
        }).populate("playerId");

        if (!existingBid) {
            // Player not in bidding ground - create new entry
            const newBid = new BidGround({
                playerId: player._id,
                status: "open",
                bids: [],
                auctionId: auctionId,
                roomId: roomId || null,
            });
            await newBid.save();
            const populated = await newBid.populate("playerId");
            console.log(`Player ${player.name} inserted into biddingground.`);
            return populated;
        } else if (existingBid.status === "open") {
            // Player found with open status - return it
            console.log(`Player ${player.name} already in biddingground and open.`);
            return existingBid;
        }
        // If we get here, player exists but status isn't open - try next player
    }

    // If we checked all players and none were available
    console.log("No available players found (all players already auctioned).");
    return null;
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