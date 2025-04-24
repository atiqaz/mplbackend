import Auction from '../../schema/auctions.schema.js'
import BiddingGround from '../../schema/bidding.schema.js'
import Teams from '../../schema/users.schema.js'


export const startAandStop = async (data) => {
    const { start, auctionId, complete } = data;

    try {
        let newStatus = null;

        if (start) {
            newStatus = "InProgress";
        } else if (complete) {
            newStatus = "Completed";
        } else {
            throw new Error("Invalid input: either start or complete must be true.");
        }

        const updatedAuction = await Auction.findOneAndUpdate(
            { _id: auctionId },
            { status: newStatus },
            { new: true }
        );

        return updatedAuction;
    } catch (error) {
        console.error('Error in startAandStop:', error);
        throw error;
    }
};


export const soldAndUnSOld = async (_id) => {
    try {
        console.log(_id);
        const currentPlayer = await BiddingGround.findOne({ _id });

        if (!currentPlayer) {
            throw new Error('Player not found');
        }

        const bidsLength = currentPlayer.bids.length;
        const updateData = {
            status: bidsLength ? "sold" : "unsold",
            ...(bidsLength && { soldTo: currentPlayer.bids[bidsLength - 1].bidderId })
        }; 

        let updatedTeam = null;

        if (bidsLength) {
            const lastBid = currentPlayer.bids[bidsLength - 1];
            const auctionId = currentPlayer.auctionId;
            const bidder = lastBid.bidderId;
            const bidAmount = lastBid.bidAmount;

            updatedTeam = await Teams.findOneAndUpdate(
                { 
                    _id: bidder,
                    "auctions.auctionId": auctionId
                },
                { 
                    $inc: { "auctions.$.remainingPurse": -bidAmount }
                },
                { 
                    new: true
                }
            );
        }

        const updatedPlayer = await BiddingGround.findOneAndUpdate(
            { _id },
            { $set: updateData },
            { new: true }
        ).populate("playerId").populate("soldTo");

        return {
            player: updatedPlayer,
            teamUpdate: bidsLength
                ? updatedTeam.auctions.find(a => a.auctionId.toString() === currentPlayer.auctionId.toString())
                : null
        };

    } catch (error) {
        console.error('Error in soldAndUnSOld:', error);
        throw error;
    }
};
