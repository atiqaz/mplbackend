import express from 'express';
import {
    createOrUpdateAuctionTerms,
    getAuctionTerms,
    changeTermsStatus,
    getTermsHistory,
    deleteAuctionTerms
} from '../controllers/terms.controller.js';
import { validateToken } from '../helper/middleware.js';

const router = express.Router();

// Create or Update Terms (Upsert)
router.put('/auctions/:auctionId/terms', validateToken , createOrUpdateAuctionTerms);

// Get Current Terms
router.get('/auctions/:auctionId/terms', getAuctionTerms);

// Change Terms Status
router.patch('/auctions/:auctionId/terms/status', validateToken, changeTermsStatus);

// Get Version History
router.get('/auctions/:auctionId/terms/history', getTermsHistory);

// Delete Terms
router.delete('/auctions/:auctionId/terms', validateToken,  deleteAuctionTerms);

export default router;