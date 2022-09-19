import express from 'express';
import { getAllTenant, getCountAlert, getCountTicket, getDashboard, getIncidentTotal } from '../controllers/dashboard/Dashboard.js';
import { validateTokenStaffAccess } from '../token/ValidateToken.js';
const router = express.Router();


router.get('/getCountTicket', validateTokenStaffAccess, async (req, res, next) => {
    let {start_day, end_day, tenant} = req.query;
    let response = await getCountTicket(start_day, end_day, tenant);
    next(response);
})

router.get('/getCountAlert',  validateTokenStaffAccess, async (req, res, next) => {
    let {start_day, end_day, tenant} = req.query;
    let response = await getCountAlert(start_day, end_day, tenant);
    next(response);
})

router.get('/getAllTenant', validateTokenStaffAccess, async (req, res, next) => {
    let response = await getAllTenant();
    next(response);
})


router.get('/getDashboard/',validateTokenStaffAccess, async (req, res, next) => {
    let {start_day, end_day, tenant} = req.query;
    let response = await getDashboard(start_day, end_day, tenant);
    next(response);
})


router.get('/getIncident/', validateTokenStaffAccess, async (req, res, next) => {
    let {start_day, end_day, tenant} = req.query;
    let response = await getIncidentTotal(start_day, end_day, tenant);
    next(response);
})


export default router;