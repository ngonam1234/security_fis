import express from 'express';
import { getCountAlert, getCountTicket, getDashboard } from '../controllers/dashboard/Dashboard.js';
const router = express.Router();


router.get('/getCountTicket', async (req, res, next) => {
    let {start_day, end_day, tenant} = req.query;
    let response = await getCountTicket(start_day, end_day, tenant);
    next(response);
})

router.get('/getCountAlert', async (req, res, next) => {
    let {start_day, end_day, tenant} = req.query;
    let response = await getCountAlert(start_day, end_day, tenant);
    next(response);
})


router.get('/getDashboard/', async (req, res, next) => {
    let {start_day, end_day, tenant} = req.query;
    let response = await getDashboard(start_day, end_day, tenant);
    next(response);
})


export default router;