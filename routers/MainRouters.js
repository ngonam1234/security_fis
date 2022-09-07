import express from 'express';
import { getAllAlert } from '../controllers/AlertController.js';
import { getAllSensor } from '../controllers/SensorController.js';
import { getAllTicket } from '../controllers/TicketController.js';
import { getAllUser } from '../controllers/UserController.js';

const router = express.Router();


router.get('/getAllAlert', async (req, res, next) => {
    let response = await getAllAlert();
    next(response);
})


router.get('/getAllTicket', async (req, res, next) => {
    let response = await getAllTicket();
    next(response);
})

router.get('/getAllSensor', async (req, res, next) => {
    let response = await getAllSensor();
    next(response);
})

router.get('/getAllUser', async (req, res, next) => {
    let response = await getAllUser();
    next(response);
})

export default router;