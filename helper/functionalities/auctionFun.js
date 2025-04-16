import Auction from '../../schema/auctions.schema.js'


export const startAandStop = async (data) => {
    const { start, auctionId } = data
    try {
        const isStarted = await Auction.findOneAndUpdate({ _id: auctionId }, {
            status: start ? "InProgress" : "Completed"
        },{new: true})
        return isStarted
    } catch (error) {
        return error
    }
}