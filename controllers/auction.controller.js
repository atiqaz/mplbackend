import mongoose from "mongoose";
import error from "../helper/res.error.js"
import success from "../helper/res.success.js"
import AuctionModel from "../schema/auctions.schema.js"
import UserModel from '../schema/users.schema.js'
import PlayerModel from '../schema/player.schema.js'
import BiddingGround from "../schema/bidding.schema.js"



const createAuction = async (req, res) => {
    try {
        // Validate request body
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: "Invalid request: Missing auction data." });
        }
        var newId = new mongoose.mongo.ObjectId();
        const romId = `room:${newId}`
        // Create a new auction instance
        const body = {
            ...req.body,
            roomId: romId
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

const getupcomingAuctions = async (req, res) => {

    try {
        const auctions = await AuctionModel.find({ status: { $ne: 'Completed' } })
        console.log(auctions)
        success.successResponse(res, auctions, 'All active Auction ')
    } catch (err) {
        error.InternalServerError(res, err.message)
    }

}
const getAllAuctions = async (req, res) => {

    try {
        const { filter } = req.query; // Query parameter se filter get kar rahe hain
        const currentDate = new Date(); // Current date for comparison

        let filterCondition = {};

        if (filter === "upcoming") {
            filterCondition.auctionDate = { $gt: currentDate }; // Future auctions
        } else if (filter === "live") {
            filterCondition.auctionDate = { $lte: currentDate }; // Auctions started but not completed
            filterCondition.status = "InProgress";
        } else if (filter === "finished") {
            filterCondition.auctionDate = { $lt: currentDate }; // Past auctions
            filterCondition.status = "Completed";
        }

        const auctions = await AuctionModel.find(filterCondition);
        console.log(auctions);

        return success.successResponse(res, auctions, 'Auctions retrieved')
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};

const getSingleAuction = async (req, res) => {
    console.log('called')
    try {
        const auction = await AuctionModel.findById(req.params.id)
        if (!auction) return error.NOT_FOUND(res, 'Auction not found')
        console.log(auction)
        success.successResponse(res, auction, 'Single Auction ')
    } catch (err) {
        error.InternalServerError(res, err.message)
    }

}
const updateAuctionDoc = async (auctionId) => {
    console.log({ auctionId })

    return await AuctionModel.findOneAndUpdate({ _id: auctionId }, { status: "InProgress" }, { new: true });
}

const getStartedAuction = async (auctionId) => {
    return await AuctionModel.findOne({ _id: auctionId })
}
const endAuction = async (auctionId) => {
    return await AuctionModel.findOneAndUpdate({ _id: auctionId }, { status: "Completed" }, { new: true })
}

const getSingleAuctionWithFUlldetails = async (req, res) => {
    const id = req.params
    const {onlyTeams}=req.query
    console.log({onlyTeams})
    console.log(id)

    try {
        const isValidId = new mongoose.mongo.ObjectId(id)
        if (!isValidId) {
            return error.BadRequest(res, 'Invalid ID')
        }

        const auction = await AuctionModel.findById(isValidId)
        const users = await UserModel.aggregate([
            {
                $match: { "auctions.auctionId": isValidId }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    phone: 1,
                    auction: {
                        $filter: {
                            input: "$auctions",
                            as: "auction",
                            cond: { $eq: ["$$auction.auctionId", isValidId] }
                        }
                    }
                }
            }
        ]);
        if(onlyTeams==='true'){
            return success.successResponse(res, users, 'Auction details with user info ')
        }

        const players = await PlayerModel.aggregate([
            {
                $match: { "auctions.auctionId": isValidId }
            },
            {
                $unset: "auctions" // Removes the 'auctions' field from the output
            }
        ])
     
        const data = {
            auction: auction,
            teams: users, // Assuming user schema has a field 'user'
            players: players // Assuming player schema has a field 'player'
        }
        success.successResponse(res, data, 'Auction details with user info ')
    } catch (err) {
        error.InternalServerError(res, err.message)

    }


}


const AssignPurseToAuction = async (req, res) => {
    const { auctionId, price } = req.body;
    console.log("Auction ID:", auctionId);
    try {
        // First, find the matching users (optional for logging/debugging)
        const users = await UserModel.find({ auctions: { $elemMatch: { auctionId: auctionId } } });
        console.log("Matched Users:", users);

        // Then update the price in the matched auction
        const updateResult = await UserModel.updateMany(
            { 'auctions.auctionId': auctionId },
            {
                $set: {
                    'auctions.$[elem].totalPurse': price,
                    'auctions.$[elem].remainingPurse': price
                }
            },
            {
                arrayFilters: [{ 'elem.auctionId': auctionId }]
            }
        );

        // res.status(200).json({ message: 'Price updated successfully', result: updateResult });
        success.successResponse(res, updateResult, 'Price updated successfully ')
    } catch (error) {
        console.error("Error updating price:", error);
        error.InternalServerError(res, err.message)
    }
};

const getSingleAuctionWithFUlldetailsWithBids = async (req, res) => {
    try {
        const users = await BiddingGround.find({ auctionId: req.params.id }).populate('playerId').populate('auctionId')
        console.log({users})
        success.successResponse(res, users, 'Auction details with user info ')
    } catch (err) {
        error.InternalServerError(res, err.message)

    }
}

export {
    createAuction, getupcomingAuctions,
    getSingleAuction, updateAuctionDoc, getStartedAuction,
    endAuction, getAllAuctions, getSingleAuctionWithFUlldetails, AssignPurseToAuction, getSingleAuctionWithFUlldetailsWithBids
}