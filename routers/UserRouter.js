import express from 'express';
import { OK, SYSTEM_ERROR } from '../constant/HttpResponseCode.js';
import { changePassword, createUser, getAllUser, login, resetFirstLogin2FA, update } from '../controllers/users/UsersController.js';
import { refreshToken, validateTokenStaffAccess } from '../token/ValidateToken.js';
import myLogger from '../winstonLog/winston.js';

const router = express.Router();



router.get('/getAllUser', validateTokenStaffAccess, async (req, res, next) => {
    let response = await getAllUser();
    next(response);
})

router.post('/createUser', validateTokenStaffAccess, async (req, res, next) => {
    let { email, fullname, is_active, password, phone, role, telegram, tier, tenant } = req.body;
    let response = await createUser(email, fullname, is_active, password, phone, role, telegram, tier, tenant);
    next(response);
})

router.put('/:id/password', validateTokenStaffAccess, async (req, res, next) => {
    let { oldPass, newPass } = req.body;
    let response = undefined;
    let { id } = req.params;
    response = await changePassword(id, oldPass, newPass)
    next(response);

})
router.put('/:id/', validateTokenStaffAccess, async (req, res, next) => {
    myLogger.info("in ---------------")
    let { is_active, fullname, email, twoFA, roleCode, permissions } = req.body;
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
    } else if (roleCode !== undefined) {
        response = await update({ id }, { roleCode })
    }
    else if (permissions !== undefined) {
        response = await update({ id }, { permissions })
    }
    else {
        response = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    }
    next(response);
})

router.put('/:id/resetFirstLogin2FA', validateTokenStaffAccess, async (req, res, next) => {
    let { id } = req.params;
    let response = await resetFirstLogin2FA(id)
    next(response);
})

router.post('/login', async (req, res, next) => {
    let { email, password } = req.body;
    let response = await login(email, password)
    next(response);
})

router.post('/refreshToken', async (req, res, next) => {
    let { refreshtoken } = req.headers;
    let data = refreshToken(refreshtoken);
    let { status, accessToken } = data
    if (status === true) {
        next({ statusCode: OK, data: { accessToken } });
    } else {
        next({ statusCode: SYSTEM_ERROR, error: 'SYSTEM_ERROR', description: 'system error ne!!!' });
    }
})




export default router;
