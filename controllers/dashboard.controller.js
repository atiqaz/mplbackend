import success from '../helper/res.success.js';
import Player from '../schema/player.schema.js';
import Users from '../schema/users.schema.js'
import BiddingGround from '../schema/bidding.schema.js';
import error from '../helper/res.error.js';


const getSummary = async (req, res) => {
    const { type, auctionId } = req.query;

    try {
        let data;

        // Define common query filters
        const auctionFilter = auctionId ? { auctionId } : {};

        if (type) {
            let players;

            switch (type) {
                case "Registered Players":
                    players = await Player.find(auctionFilter);
                    break;
                case "Wicketkeepers":
                    players = await Player.find({ isWicketkeeper:"yes", ...auctionFilter });
                    break;
                case "Batsman":
                    players = await Player.find({ playerRole: "Batsman", ...auctionFilter });
                    break;
                case "Bowlers":
                    players = await Player.find({ playerRole: "Bowler", ...auctionFilter });
                    break;
                case "All Rounders":
                    players = await Player.find({ playerRole: "Allrounder", ...auctionFilter });
                    break;
                case "Teams":
                    data = await Users.find({ role: "organisation", status: "accepted", ...auctionFilter });
                    return success.successResponse(res, data, "Teams retrieved successfully");
                default:
                    return success.errorResponse(res, "Invalid type provided");
            }

            // Fetch bidding details for each player
            const playersWithBids = await Promise.all(players.map(async (player) => {
                const biddingDetails = await BiddingGround.findOne({ playerId: player._id });
                return { ...player.toObject(), biddingDetails };
            }));

            return success.successResponse(res, playersWithBids, `${type} retrieved successfully`);
        } else {
            // Fetch all player categories
            const [
                players,
                wicketKeepers,
                batsmen,
                bowlers,
                allrounders,
                registeredTeams
            ] = await Promise.all([
                Player.find(auctionFilter),
                Player.find({ isWicketkeeper:"yes", ...auctionFilter }),
                Player.find({ playerRole: "Batsman", ...auctionFilter }),
                Player.find({ playerRole: "Bowler", ...auctionFilter }),
                Player.find({ playerRole: "Allrounder", ...auctionFilter }),
                Users.find({ role: "organisation", ...auctionFilter })
            ]);

            // Fetch bidding details for each player
            const playersWithBids = await Promise.all(players.map(async (player) => {
                const biddingDetails = await BiddingGround.findOne({ playerId: player._id });
                return { ...player.toObject(), biddingDetails };
            }));

            data = {
                registeredPlayers: playersWithBids,
                wicketKeepersCount: wicketKeepers.length,
                batsman: batsmen.length,
                bowlers: bowlers.length,
                allrounders: allrounders.length,
                registeredTeams: registeredTeams.length,
            };
        }

        success.successResponse(res, data, "Summary retrieved successfully");
    } catch (err) {
        console.error(err);
        // success.errorResponse(res, "Failed to retrieve summary", error);
        error.InternalServerError(res,"Failed to retrieve summary",error)
    }
};

export { getSummary }