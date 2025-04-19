
import mongoose from "mongoose";
import User from "../../schema/users.schema.js";


const finduser = async (id) => {
    const user = await User.findOne({ _id: id })
    return user
}
const findUserWithProperDetails = async (id, auctionId) => {
    const user = await User.findOne({ _id: id })
    if (!user) {
        console.log('User not found');
        return;
    }

    const matchedAuction = user.auctions.find(a =>
        a.auctionId && a.auctionId.equals(new mongoose.Types.ObjectId(auctionId))
    );
    console.log(matchedAuction)

    const isValidTeam = user.role === "organisation"
    const returnValue = {
        isValidTeam: (isValidTeam && matchedAuction) ? true : false,
        name: user.name,
        phone: user.phone
    }

    if (matchedAuction) {
        returnValue.totalPurse = matchedAuction.totalPurse
        returnValue.remainingPurse = matchedAuction.remainingPurse
    }
    return returnValue
}

export {
    finduser,
    findUserWithProperDetails
}