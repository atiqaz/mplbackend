

import express from 'express';
const router = express.Router();
import { createPlayer, getAllPlayer, getPlayersofIndividualAuction, getsinglePlayer, getsinglePlayerWithAuctionDetails, playerLogin, updatePlayerAuctions, uploadImage } from '../controllers/player.controller.js';
import { uploadImageSingle } from '../helper/multer/multer.js';



// Get all players
router.get('/', getAllPlayer);

// Create a new player
router.post('/', createPlayer);

router.post('/login',playerLogin)

router.get('/player/:id',getsinglePlayer)

router.post('/player/auctiondetails/:id', getsinglePlayerWithAuctionDetails)

router.get('/player/auction/:AuctionId', getPlayersofIndividualAuction)



router.patch('/player/:id',uploadImageSingle('file'), uploadImage)

router.patch('/player/update/:id/auctions', updatePlayerAuctions)


export  default router;