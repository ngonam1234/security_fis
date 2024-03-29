import { v1 as uuidv1, v1 } from 'uuid'
import { BAD_REQUEST, OK, SYSTEM_ERROR } from "../../constant/HttpResponseCode.js";
import Alert from "../../models/Alert.js";
import Ticket from "../../models/Ticket.js";
import { parseDate } from "../../validation/ValidationUtil.js";
import myLogger from "../../winstonLog/winston.js";



export async function getAllAlert(start_day, end_day, tenant, limit, page) {

    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let today = new Date();
    let fromDate = start_day ? parseDate(start_day, 'yyyy-MM-DD').toDate() : new Date(today.setMonth(today.getMonth() - 1));
    let endDate = end_day ? parseDate(end_day, 'yyyy-MM-DD').toDate() : new Date(today.setDate(today.getDate() + 1));
    let andCondition = tenant ? {
        tenant,
        create_time: {
            '$gt': fromDate,
            '$lt': endDate
        }
    } : {
        create_time: {
            '$gt': fromDate,
            '$lt': endDate
        }
    }
    let limitView = limit || 10
    let pageView = page || 0;
    pageView *= limitView
    let alerts = await Alert.find(andCondition).limit(limitView).skip(Math.round(pageView)).sort({ create_time: -1 });
    let info1 = await Alert.find(andCondition).sort({ create_time: -1 }).count();

    let totalPage = Math.round(info1 / limitView);
    if (info1 % limitView > 0) {
        totalPage -= 1
    }
    myLogger.info("%o", info1 / limitView)
    myLogger.info("%o", totalPage)
    myLogger.info("pageView %o", pageView)
    ret = { statusCode: OK, data: { start_day, end_day, tenant, limit: limitView, alerts, totalPage, page: pageView, pageIndex: page } };
    return ret;
}

export async function getDetailAlert(id) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let info = await Alert.findOne({ id })
    myLogger.info("%o", info)
    ret = { statusCode: OK, data: { info } };
    return ret;
}

export async function queryAdvanced(queryObj) {
    myLogger.info("In ->>>>>>")
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    try {
        queryObj = { ...queryObj }
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(el => delete queryObj[el])

        let queryString = JSON.stringify(queryObj)
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        let query = Alert.find(JSON.parse(queryString))


        if (sort) {
            const sortBy = query.sort.split(',').join(' ')
            query = query.sort(sortBy)
        } else {
            query = query.sort('-create_time')
        }

        const tours = await query
        ret = { statusCode: OK, data: tours };
        myLogger.info("OUT ->>>>>>")

    } catch (error) {
        ret = { statusCode: BAD_REQUEST, data: 'Bad request' };
    }
    return ret;
}

function parseStringQuery(query) {
    let ret = Object.create(null);
    //url =    path?query=name%like%Binh,Hung;status%eq%Closed
    // req.query = name%eq%Binh;status%eq%Closed
    let qs = query.split(';'); // 
    for (let q of qs) { // q = name%eq%Binh
        let objs = q.split('%'); //[name,eq,Binh]
        if (objs.length === 3) {
            if (objs[1] === 'eq') {
                ret[objs[0]] = objs[2];
            } else if (objs[1] === 'like') {
                let objs1 = objs[2].split(',')
                let m = objs1[0];
                for (let i = 1; i < objs1.length; i++) {
                    m += `.*${objs1[i]}`;
                }
                // let t = {$or : m};
                let temp = { $regex: m };
                ret[objs[0]] = temp;
            } else if (objs[1] === 'neq') {
                let temp = { $ne: objs[2] };
                ret[objs[0]] = temp;
            }
            else if (objs[1] === 'gt') {
                let temp1 = { $ne: objs[2] };
                ret[objs[0]] = temp1;
            }
            else if (objs[1] === 'lt') {
                let temp2 = { $ne: objs[2] };
                ret[objs[0]] = temp2;
            }
        }
    }
    return ret;
}

export async function getAlert(query, limit, sort, page) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let query1 = parseStringQuery(query);
    myLogger.info("%o", query1);
    let limitView = limit || 10
    let pageView = page || 0;
    pageView *= limitView
    let info = await Alert.find(query1).limit(limit).skip(Math.round(pageView)).sort(sort);
    let info1 = await Alert.find(query1).sort(sort).count();
    let totalPage = Math.round(info1 / limitView);
    myLogger.info("info1 %o", info1)
    myLogger.info("totalPage %o", totalPage)
    // if(info1 % limitView > 0){
    //     totalPage += 1
    // }
    myLogger.info("totalPage %o", totalPage)
    ret = { statusCode: OK, data: { limit: limitView++, pageIndex: page == null ? 0 : page++, totalPage, page: pageView, info } };
    return ret;
}

export async function reviewAlert(filter, body) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let model = await Alert.findOneAndUpdate(
        filter, body, { new: true }
    )
    myLogger.info("%o", model)
    ret = { statusCode: OK, data: model };
    return ret;
}


export async function reviewAlert2(idtxt) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let listId = [];
    idtxt.forEach(o => {
        listId.push(o)
    })
    // myLogger.info("listId %o", listId)
    if (listId.length === 0) {
        let dataInvaid = { status: 'Failed', description: `Please select at least one message`, error: "DATA_INVALID" }
        ret = { statusCode: BAD_REQUEST, data: { dataInvaid } };
    } else {
        let model = await Alert.updateMany(
            { id: { $in: listId } },
            { $set: { is_closed: true, reviewed_time: new Date() } }
        )
        // myLogger.info("%o", model)
        ret = { statusCode: OK, data: model };
    }
    return ret;
}

export async function updateIs_Ticket(filter, body) {
    let model = await Alert.findOneAndUpdate(
        filter, body, { new: true }
    )
    // myLogger.info("%o", model)
}

function checkIfDuplicateExists(arr) {
    return new Set(arr).size !== arr.length
}

export async function createTicket(idAlert, severity, created_by, owners) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    myLogger.info("%o", { idAlert, severity, created_by, owners })
    let listOwner = [];

    owners.forEach(o => {
        listOwner.push(o)
    })
    myLogger.info("listOwner size %o", listOwner.length)

    if (listOwner.length === 0) {
        myLogger.info("in ->>>>>>>>>>>>")
        let dataInvaid = { status: 'Failed', description: `owner is required`, error: "DATA_INVALID" }
        ret = { statusCode: BAD_REQUEST, data: { dataInvaid } };
    }
    else if (checkIfDuplicateExists(listOwner) == true) {
        myLogger.info('BUG')
        let dataInvaid = { status: 'Failed', description: `owner is Duplicate`, error: "DATA_INVALID" }
        ret = { statusCode: BAD_REQUEST, data: { dataInvaid } };
    }
    else {
        let info = await Alert.findOne({ id: idAlert })
        // myLogger.info("%o", info)
        let model = new Ticket({
            id: v1(),
            alert_id: info.id,
            demisto_id: 'comming',
            ticket_name: info.alert_name,
            tenant: info.tenant,
            severity,
            created_by,
            create_time: new Date(),
            is_closed: true,
            owner_id: listOwner,
        })
        model.save();
        if (idAlert !== undefined) {
            let updateIsTicket = await updateIs_Ticket({ id: idAlert }, { is_ticket: true })
            // myLogger.info("%o", updateIsTicket)
        }
        // myLogger.info("%o", model)
        ret = { statusCode: OK, data: { model } };
    }
    return ret;
}