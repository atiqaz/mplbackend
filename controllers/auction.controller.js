import mongoose from "mongoose";
import error from "../helper/res.error.js"
import success from "../helper/res.success.js"
import AuctionModel from "../schema/auctions.schema.js"



const createAuction = async (req, res) => {
    try {
        // Validate request body
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: "Invalid request: Missing auction data." });
        }
        var newId = new mongoose.mongo.ObjectId();
        const romId = `room:${newId}`
        // Create a new auction instance
        const body ={
            ...req.body,
            roomId:romId
        }
        const auction = new AuctionModel(body);

        // Save the auction to the database
        const data = await auction.save();

        // Return success response
        return success.successCreatedResponse(res, data, "Auction Created Successfully.");
    } catch (err) {
        console.error("Error creating auction:", err);

        // Handle validation errors specifically
        if (err.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Validation error.",
                errors: Object.values(err.errors).map((error) => error.message),
            });
        }

        // Handle duplicate key errors (e.g., unique constraints)
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            return res.status(409).json({
                success: false,
                message: `Duplicate key error: ${field} already exists.`,
            });
        }

        // Handle other internal server errors
        return error.InternalServerError(res, err.message);
    }
};

const getupcomingAuctions = async (req,res) => {
    
    try {
        const auctions = await AuctionModel.find({ status:{ $ne: 'Completed' } })
        console.log(auctions)
        success.successResponse(res, auctions, 'All active Auction ')
    } catch (err) {
        error.InternalServerError(res, err.message)
    }

}
const getAllAuctions = async (req,res) => {
    
    try {
        const auctions = await AuctionModel.find()
        console.log(auctions)
        success.successResponse(res, auctions, 'All Auctions reteived successfully')
    } catch (err) {
        error.InternalServerError(res, err.message)
    }

}

const getSingleAuction =async(req,res)=>{
    try {
        const auction = await AuctionModel.findById(req.params.id)
        if(!auction) return error.NOT_FOUND(res, 'Auction not found')
            console.log(auction)
        success.successResponse(res, auction, 'Single Auction ')
    } catch (err) {
        error.InternalServerError(res, err.message)
    }

}
const updateAuctionDoc = async(auctionId)=>{
    console.log({auctionId})
    
    return await AuctionModel.findOneAndUpdate({ _id:auctionId }, { status: "InProgress" }, { new: true });
}

const getStartedAuction  = async (auctionId)=>{
return await AuctionModel.findOne({_id:auctionId})
}
const endAuction =async(auctionId)=>{
return await AuctionModel.findOneAndUpdate({ _id:auctionId }, { status: "Completed" }, { new: true })
}

export { createAuction, getupcomingAuctions ,getSingleAuction ,updateAuctionDoc ,getStartedAuction ,endAuction ,getAllAuctions}