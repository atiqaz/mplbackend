import { addBid, playerToBidGround, soldToFunctionalities, unSoldFunctionalities } from "../controllers/biddingGround.controller.js"
import { saveMessages } from "../controllers/GroupMessagesControler.js"
import { getAllMessagesPrivate, individualConversationSave } from "../controllers/IndividualConversations.js"
import { getOnlineuser, saveuser } from "../controllers/onlineUser.controller.js"
import { getLatestPlayerWithHighestBasePrice } from "../controllers/player.controller.js"
import OnlineUser from "../schema/socket.schema.js"
import AuctionDetails from "../schema/auctions.schema.js"
import { endAuction, getStartedAuction, updateAuctionDoc } from "../controllers/auction.controller.js"
import UserSchema from "../schema/users.schema.js"


function logTimeExpired() {
    const startTime = new Date();
    console.log(`Start time: ${startTime.toLocaleTimeString()}`);

    setTimeout(() => {
        console.log('time expired')
        return "Time Expired"
    }, 10000); // 10,000 milliseconds = 10 seconds
}
export default () => {
    global.io.on('connection', (socket) => {
        console.log('new User connected', socket.id)

        socket.on('go:online', (data) => {
            saveuser(data)

        })

        socket.on("onlineUsers", async () => {
            const users = await getOnlineuser(socket.id)
            socket.emit("onlineUsers", users)
        })


        socket.on('disconnect', async () => {
            console.log('user disconnected', socket.id)
            try {
                const res = await OnlineUser.findOneAndDelete({ socketId: socket.id })
                socket.emit("onlineUsers", res)
            } catch (error) {
                console.log(error)
            }
        })

        socket.on('chat:message', async (msg) => {
            console.log(msg)
            // console.log(msg)
            await saveMessages(msg)
            global.io.emit('chat:message', msg)
        })

        socket.on('getPrivate:messages', async (data) => {
            const messages = await getAllMessagesPrivate(data)
            socket.emit('receivePrivate:messages', messages);
        })
        socket.on('private:message', async (data) => {
            const { socketId, ...message } = data
            await individualConversationSave(message)
            global.io.to(socketId).emit('private:message', message);
        })

        socket.on("start:auction", async (data) => {
            // Join the specific room
            socket.join(data.roomId);

            // Emit "start:auction" event to all clients in the same room
            global.io.to(data.roomId).emit("start:auction", data);

            // Fetch the current player details
        });
        socket.on("start:auctionTable", async (data) => {
    
            // ----------------update auction doc-------------------
            // start:auctionTable
            const started = await updateAuctionDoc(data.auctionId)

            global.io.to(data.roomId).emit("start:auctionTable", data);

            const currentPlayer = await playerToBidGround(data.auctionId)

            global.io.to(data.roomId).emit("currentPlayer", currentPlayer);
        })
        socket.on("isAuctionStarted", async (data) => {
            console.log('isAuctionStarted', data)
            const started = await getStartedAuction(data.auctionId)
            console.log(started)
            const isStarted = started.status === "InProgress"
            const currentPlayer = await playerToBidGround(data.auctionId)

            io.to(data.socketId).emit("isAuctionStarted", {
                isStarted,
            });
            if (isStarted) {

                io.to(data.socketId).emit("currentPlayer", currentPlayer);
            }
        })

        socket.on("join:room", async (data) => {
            console.log(data)
            const room = await AuctionDetails.findOne({ _id: data.auctionId })
            socket.join(room.roomId)
            const user = await OnlineUser.findOne({ userId: data.userId }).populate("userId")
            const userDetails = {
                userId: user.userId,
                username: user.username,
                avatar: user.avatar,
                socketId: user.socketId,
                role: user.role,
                roomId: data.roomId
            }
            console.log(room.roomId)
            socket.broadcast.to(room.roomId).emit("user:joined", userDetails);

        })

        socket.on("place:Bid", async (data) => {
            console.log(data)
            const bids = await addBid(data)
            global.io.to(data.roomId).emit("currentBid", bids)
        })
        socket.on("outOfRace", async (data) => {
            console.log('player out of', data)

            global.io.to(data.roomId).emit("outOfRace", data)
        })
        socket.on("soldTo", async (data) => {
            console.log('soldTo', data)

            const result = await soldToFunctionalities(data)
            // global.io.emit("soldTo", result)
            global.io.to(data.roomId).emit("soldTo", result)

            setTimeout(async () => {
                const currentPlayer = await playerToBidGround(data.auctionId)
                console.log({ currentPlayer })
                global.io.to(data.roomId).emit("currentPlayer", currentPlayer);

            }, 3000);

        })
        socket.on("unSold", async (data) => {
            console.log('unSold', data)

            const result = await unSoldFunctionalities(data)
            // global.io.emit("soldTo", result)
            global.io.to(data.roomId).emit("unSold", result)

            setTimeout(async () => {
                const currentPlayer = await playerToBidGround(data.auctionId)
                console.log({ currentPlayer })
                global.io.to(data.roomId).emit("currentPlayer", currentPlayer);

            }, 3000);

        })

        socket.on("lastChance", (data) => {
            global.io.to(data.roomId).emit("lastChance", {
                message: "Its Your last chance to Bid for this player"
            });
        })
        socket.on("EndAuction",async (data) => {
            console.log('End Auction', data)
            const complete =await endAuction(data.auctionId)
            console.log(complete)
            global.io.to(data.roomId).emit('auctionEnd',{
                complete,
                message: "Auction has ended"
            })
        })
        socket.on('getPurse',async(data)=>{
            console.log('getPurse',{data})
            const user = await UserSchema.findOne({_id:data.userId})
            io.to(data.socketId).emit('getPurse', user.remainingPurse);

        })
    })

}