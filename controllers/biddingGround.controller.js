import BiddingGround from "../schema/bidding.schema.js"
import Player from "../schema/player.schema.js";
import UserSchema from  '../schema/users.schema.js'

const addBid = async (data) => {
  const { playerId, bidderId, bidAmount, bidderName } = data
  try {
    // Find the bidding ground document for the player
    let biddingGround = await BiddingGround.findOne({ playerId });

    if (!biddingGround) {
      // Create a new bidding ground document if it doesn't exist
      biddingGround = new BiddingGround({ playerId, bids: [] });
    }

    // Calculate the next bid amount
    const lastBid = biddingGround.bids[biddingGround.bids.length - 1];
    const nextBidAmount = bidAmount + 1000;

    // Add the new bid to the `bids` array
    biddingGround.bids.push({
      bidderId,
      bidderName,
      bidAmount,
      bidTime: new Date(),
      nextBidAmount,
    });

    const result = await biddingGround.save();
    return result
  } catch (error) {
    console.error("Error adding bid:", error);
  }
};

const playerToBidGround = async (roomId) => {
  console.log({ roomId });

  // Step 1: Check if there's already a player with "open" status in BiddingGround for this auction
  const existingOpenPlayer = await BiddingGround.findOne({ status: "open", auctionId: roomId }).populate("playerId");

  if (existingOpenPlayer) {
    return {
      message: "Player already in battleground with open status",
      data: {
        player: existingOpenPlayer.playerId,  // Player details
        battleground: existingOpenPlayer     // Battleground details
      }
    };
  }

  // Step 2: Find a new player who is NOT already in BiddingGround for this auction
  const assignedPlayers = await BiddingGround.distinct("playerId", { auctionId: roomId });

  const newPlayer = await Player.findOne({
    _id: { $nin: assignedPlayers }, // Exclude players already in this auction's BiddingGround
    auctionId: roomId, // Ensure the player belongs to the same auction
  });

  if (newPlayer) {
    // Add new player to BiddingGround
    const playerRecord = new BiddingGround({
      playerId: newPlayer._id,
      status: "open", 
      bids: [],
      auctionId: roomId,
    });

    await playerRecord.save();

    return {
      message: "New player joined the battleground",
      data: {
        player: newPlayer,          // Player details
        battleground: playerRecord  // Battleground details
      }
    };
  }

  // Step 3: No available player found
  return { message: "No available player found", data: null };
};





const soldToFunctionalities = async (data) => {
  const { playerId } = data
  const biddingGround = await BiddingGround.findOne({
    playerId,
    status: "open", // Ensure the player is still open for bidding
  }).populate("bids.bidderId");

  if (!biddingGround) {
    return { message: "No active bidding found for this player." };
  }

  const lastBid = biddingGround.bids[biddingGround.bids.length - 1];
  // console.log(lastBid)
  const bidder = lastBid.bidderId;
  const bidAmount = lastBid.bidAmount;
  
      const newUser = await UserSchema.findOneAndUpdate(
          { _id: bidder }, // Find the user by their ID
          { $inc: { remainingPurse: -bidAmount } }, // Decrease remainingPurse by bidAmount
          { new: true } // Return the updated user document
      );
  
      if (!newUser) {
          console.log("User not found.");
      } else {
          console.log("Updated User Purse:", newUser.remainingPurse);
      }
  biddingGround.status = "sold";

  biddingGround.soldTo = lastBid.bidderId; // Set the last bidder as the buyer
  const res = await biddingGround.save()

  return {
    message: "Player sold successfully.",
    status: "sold",
    bidder: lastBid.bidderName,
    bidAmount: lastBid.bidAmount,
    bidderId: lastBid.bidderId
  };
}

const unSoldFunctionalities =async(body)=>{
  const {playerId ,auctionId} = body
try {
  const filter = { playerId ,auctionId };
const update = { status: "unSold" };
const doc = await BiddingGround.findOneAndUpdate(filter, update, {
  new: true
});
return doc
} catch (error) {
  
}
}
export { addBid, soldToFunctionalities ,playerToBidGround ,unSoldFunctionalities }