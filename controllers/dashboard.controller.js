
import Player from "../schema/player.schema.js"
import Users from '../schema/users.schema.js'
import Auction from '../schema/auctions.schema.js'
import success from "../helper/res.success.js"
import error from "../helper/res.error.js"




export const getSummary = async (req, res) => {
    try {
        const players = await Player.find()
        const users = await Users.find()
        const auctions = await Auction.find()

        const totalPlayers = players.length
        const totalUsers = users.length
        const totalAuctions = auctions.length
        const data = {
            totalPlayers,
            totalUsers,
            totalAuctions
        }
        success.successResponse(res, data, 'Data Retrieved')

    } catch (err) {

        error.InternalServerError(res, err.message, err.message)
    }


}