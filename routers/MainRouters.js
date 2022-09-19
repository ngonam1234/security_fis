import express from 'express';
import { getAllAlert } from '../controllers/convert/AlertController.js';
import { getAllSensor } from '../controllers/convert/SensorController.js';
import { getAllTicket } from '../controllers/convert/TicketController.js';
import { getAllUser } from '../controllers/convert/UserController.js';
import { validateTokenStaffAccess } from '../token/ValidateToken.js';

const router = express.Router();


router.get('/getAllAlert', validateTokenStaffAccess, async (req, res, next) => {
    let response = await getAllAlert();
    next(response);
})


router.get('/getAllTicket', validateTokenStaffAccess,  async (req, res, next) => {
    let response = await getAllTicket();
    next(response);
})

router.get('/getAllSensor', validateTokenStaffAccess, async (req, res, next) => {
    let response = await getAllSensor();
    next(response);
})

router.get('/getAllUser', validateTokenStaffAccess,  async (req, res, next) => {
    let response = await getAllUser();
    next(response);
})

export default router;