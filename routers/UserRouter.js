import express from 'express';
import { SYSTEM_ERROR } from '../constant/HttpResponseCode.js';
import { changePassword, createUser, getAllUser, resetFirstLogin2FA, update } from '../controllers/users/UsersController.js';
import myLogger from '../winstonLog/winston.js';

const router = express.Router();



router.get('/getAllUser', async (req, res, next) => {
    let response = await getAllUser();
    next(response);
})

router.post('/createUser', async (req, res, next) => {
    let { email, fullname, is_active, password, phone, role, telegram, tier, tenant } = req.body;
    let response = await createUser(email, fullname, is_active, password, phone, role, telegram, tier, tenant);
    next(response);
})

router.put('/:id/password', async (req, res, next) => {
    let { oldPass, newPass } = req.body;
    let response = undefined;
    let { id } = req.params;
    response = await changePassword(id, oldPass, newPass)
    next(response);

})
router.put('/:id/', async (req, res, next) => {
    myLogger.info("in ---------------")
    let { is_active, fullname, email, twoFA } = req.body;
    let response = undefined;
    let { id } = req.params;
    if (is_active !== undefined) {
        response = await update({ id }, { is_active });
    } else if (fullname !== undefined) {
        response = await update({ id }, { fullname });
    } else if (email !== undefined) {
        response = await update({ id }, { email });
    } else if (twoFA !== undefined) {
        response = await update({ id }, { twoFA })
    }
    else {
        response = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    }
    next(response);
})

router.put('/:id/resetFirstLogin2FA', async (req, res, next) => {
    let { id } = req.params;
    let response = await resetFirstLogin2FA(id)
    next(response);
})





export default router;
