

import express from 'express';
const router = express.Router();
import {AssignPurseToAuction, createAuction ,getAllAuctions,getSingleAuction,getSingleAuctionWithFUlldetails,getSingleAuctionWithFUlldetailsWithBids,getupcomingAuctions} from '../controllers/auction.controller.js';

// Get all players
router.get('/', getupcomingAuctions);
router.get('/allauction', getAllAuctions);

// Create a new player
router.post('/', createAuction);

router.get('/singleAuction/:id',getSingleAuction)
router.get('/singleAuction/details/:id',getSingleAuctionWithFUlldetails)
router.get('/singleAuction/details/bids/:id',getSingleAuctionWithFUlldetailsWithBids)
router.put('/singleAuction/assignPurse',AssignPurseToAuction)


// router.put('/singleAuction/assignPurse')



export  default router;