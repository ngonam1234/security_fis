import express from 'express';
import { createUser, getAllUser } from '../controllers/users/UsersController.js';

const router = express.Router();



router.get('/getAllUser', async (req, res, next) => {
    let response = await getAllUser();
    next(response);
})

router.post('/createUser', async (req, res, next) => {
    let { email, fullname, is_active, password, phone, role, telegram, tier } = req.body;
    let response = await createUser(email, fullname, is_active, password, phone, role, telegram, tier);
    next(response);
})

export default router;
