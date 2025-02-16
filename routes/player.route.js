

import express from 'express';
const router = express.Router();
import {createPlayer ,getAllPlayer, getsinglePlayer, playerLogin, uploadImage} from '../controllers/player.controller.js';
import { uploadImageSingle } from '../helper/multer/multer.js';



// Get all players
router.get('/', getAllPlayer);

// Create a new player
router.post('/', createPlayer);

router.post('/login',playerLogin)

router.get('/player/:id',getsinglePlayer)

router.patch('/player/:id',uploadImageSingle('file'), uploadImage)


export  default router;