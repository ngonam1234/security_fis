import express from 'express';
import { createTicket, getAlert, getAllAlert, getDetailAlert, reviewAlert, reviewAlert2, updateIs_Ticket } from '../controllers/alert/AlertController.js';
import { validateTokenStaffAccess } from '../token/ValidateToken.js';
import { createTicketByAlert } from '../validation/Valid.js';
import myLogger from '../winstonLog/winston.js';
const router = express.Router();


router.get('/getAllAlert', async (req, res, next) => {
    let { start_day, end_day, tenant, limit, page } = req.query;
    let response = await getAllAlert(start_day, end_day, tenant, limit, page);
    next(response);
})

router.get('/:id', async (req, res, next) => {
    let { id } = req.params;
    let response = await getDetailAlert(id);
    next(response);
})


router.get('/', async (req, res, next) => {
    let { query, limit, sort, page } = req.query;
    let response = await getAlert(query, limit, sort, page);
    next(response);
})

// router.put('/:id/', async (req, res, next) => {
//     myLogger.info("in ---------------")
//     let { id } = req.params;
//     let response = undefined;
//     response = await reviewAlert({ id }, { reviewed_time: new Date(), is_closed: true});
//     next(response);
// })

router.put('/review', async (req, res, next) => {
    let { id } = req.body;
    let response = undefined;
    response = await reviewAlert2(id);
    next(response);
})


// router.put('/is_close/:id/', async (req, res, next) => {
//     myLogger.info("in ---------------")
//     let { id } = req.params;
//     let response = undefined;
//     response = await updateIs_Ticket({ id }, { is_closed: true });
//     next(response);
// })


router.post('/create/:id', createTicketByAlert, async (req, res, next) => {
    let { id } = req.params;
    let { severity, owners } = req.body;
    if (owners.length == 0) {
        myLogger.info('BUG')
    }
    let { email } = req.payload;
    let acc = email.split("@");
    let response = await createTicket(id, severity, acc[0], owners);
    next(response)
})

export default router;
