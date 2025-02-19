import  Players from '../../schema/player.schema.js'

const getPlayersWithAuctionId = async (auctionId)=>{
    console.log(auctionId)
const players = await Players.find({ auctions: auctionId }).populate("auctions");
return players
}
export {
    getPlayersWithAuctionId,
 
}