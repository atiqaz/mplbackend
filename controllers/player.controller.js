
import express from 'express';
import Player from '../schema/player.schema.js';
import ErrorResponse from '../helper/res.error.js';
import success from '../helper/res.success.js';
import BiddingGround from "../schema/bidding.schema.js"
import mongoose from 'mongoose';




const createPlayer = async (req, res) => {
  console.log(req.body);
  const { email, phone } = req.body;

  // if (!email ||!phone) {
  //   return res.status(400).json({ message: 'Email and phone number are required' });
  // }
  const findPlayer = await Player.findOne({ email: email, phone: phone });
  if (findPlayer) {
    return ErrorResponse.CONFLICTS(res, 'Player already exist');
  }
  const newPlayer = new Player(req.body);

  try {
    await newPlayer.save();
    success.successCreatedResponse(res, newPlayer, 'Player created successfully');
  } catch (error) {
    res.status(400).json({ message: error.message });
  }

}

const playerLogin = async(req,res)=>{
  console.log(req.body)
try {
  
  const player = await Player.findOne({ email: req.body.email});
  console.log(player)
  if (!player) {
    return ErrorResponse.Unauthorized(res, 'Invalid Credentials');
  }

  const isValidPass= await player.matchPassword(req.body.password)
  console.log(isValidPass)
  if (!isValidPass) {
    return ErrorResponse.Unauthorized(res, 'Invalid Credentials');
  }
  const token = await player.getSignedJwtToken();
  success.successResponse(res, { token, role:'player'}, 'Logged in successfully');
} catch (error) {
  
}
}


const getAllPlayer = async (req, res) => {

  try {
    const players = await Player.find();
    success.successResponse(res, players, 'Players retrieved successfully');
  } catch (error) {
    return ErrorResponse.InternalServerError(res, error.message);
  }
}


const getLatestPlayerWithHighestBasePrice = async () => {
  try {
    // const player = await playerToBidGround()
    const players = await Player.aggregate([
      // Perform a lookup to find related documents in the BiddingGround collection
      {
        $lookup: {
          from: "biddinggrounds", // Collection name for BiddingGround (lowercase and plural by default)
          localField: "_id",     // Field in Player to match
          foreignField: "playerId", // Field in BiddingGround to match
          as: "biddingInfo",     // Resulting array field
        },
      },
      // Filter out players who are already in the BiddingGround collection
      {
        $match: {
          biddingInfo: { $size: 0 }, // Only include players with no matching biddingInfo
        },
      },
      // Sort by basePrice (highest first) and createdAt (latest first)
      {
        $sort: {
          basePrice: -1,
          createdAt: -1,
        },
      },
      // Limit the result to one player
      {
        $limit: 1,
      },
    ]);

    // Return the player if found, or null if no matching player exists
    console.log(players.length > 0 ? players[0] : null)
    return players.length > 0 ? players[0] : null;
  } catch (error) {
    console.error("Error fetching player not in BiddingGround:", error.message);
    throw new Error("Failed to fetch player");
  }
};


const getsinglePlayer =async (req,res)=>{
 const playerId = req.params.id;
try {
  const  player = await Player.findOne({_id:playerId})
  const auctionId = player.auctionId
  const bidsHistory= await BiddingGround.findOne({
    playerId,
    auctionId
  })
const resData = {
  player,
  bid:bidsHistory
}
 success.successResponse(res, resData, 'Player retrieved successfully');
} catch (error) {
  
  return ErrorResponse.InternalServerError(res, error.message);
}
}

const uploadImage =async(req,res) =>{
try {
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
    return ErrorResponse.BadRequest(res, 'Invalid ID');

  }
  const filter ={
    _id:req.params.id
  }
  const update = {
   
      image:`/${req.file.destination}/${req.file.filename}`
    
  }
  const uploadImage =await Player.findOneAndUpdate(filter, update,{
    new: true
  })
  // console.log(uploadImage)
  success.successResponse(res, uploadImage, 'Image uploaded successfully');
} catch (error) {
  
  return ErrorResponse.InternalServerError(res, error.message);
}

  
}

export { createPlayer, getAllPlayer, getLatestPlayerWithHighestBasePrice ,getsinglePlayer ,uploadImage  ,playerLogin}