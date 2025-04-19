import Auction from '../../schema/auctions.schema.js'
import BiddingGround from '../../schema/bidding.schema.js'


export const startAandStop = async (data) => {
    const { start, auctionId } = data
    try {
        const isStarted = await Auction.findOneAndUpdate({ _id: auctionId }, {
            status: start ? "InProgress" : "Completed"
        }, { new: true })
        return isStarted
    } catch (error) {
        return error
    }
}

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

        const updatedPlayer = await BiddingGround.findOneAndUpdate(
            { _id },
            { $set: updateData },
            { new: true }
        );

        return updatedPlayer;
    } catch (error) {
        console.error('Error in soldAndUnSOld:', error);
        throw error;
    }
};