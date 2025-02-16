
import express from 'express';
const router = express.Router();


import {getSummary} from '../controllers/dashboard.controller.js';

router.get('/', getSummary);


export default router;
