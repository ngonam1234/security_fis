import { OK, SYSTEM_ERROR } from "../../constant/HttpResponseCode.js";
import Alert from "../../models/Alert.js";
import Ticket from "../../models/Ticket.js";
import { formatDateFMT, parseDate } from "../../validation/ValidationUtil.js";
import myLogger from "../../winstonLog/winston.js";

// lấy tổng ticket trong 1 tháng
export async function getCountTicket(start_day, end_day, tenant) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let info = undefined;
    let day = new Date();
    day.setMonth(day.getMonth() - 1)
    myLogger.info("%o", { start_day, end_day, tenant })
    if (start_day == null || end_day == null) {
        info = await Ticket.find(
            {
                tenant,
                create_time: {
                    $gt: formatDateFMT("yyyy-MM-DD", day), $lte: formatDateFMT("yyyy-MM-DD", new Date())
                }
            }
        ).count();
    } else {
        info = await Ticket.find({
            tenant,
            create_time: { $gt: formatDateFMT("yyyy-MM-DD", start_day), $lte: formatDateFMT("yyyy-MM-DD", end_day) }
        }).count();
    }
    myLogger.info(formatDateFMT("yyyy-MM-DD", day))
    myLogger.info("%o", info)
    ret = { statusCode: OK, data: { info } };
    return ret;
}

export async function getCountAlert(start_day, end_day, tenant) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let info = undefined;
    let day = new Date();
    day.setMonth(day.getMonth() - 1)
    myLogger.info("%o", { start_day, end_day, tenant })
    if (start_day == null || end_day == null) {
        info = await Alert.find(
            {
                tenant,
                create_time: {
                    $gt: formatDateFMT("yyyy-MM-DD", day), $lte: formatDateFMT("yyyy-MM-DD", new Date())
                }
            }
        ).count();
    } else {
        info = await Alert.find({
            tenant,
            create_time: { $gt: formatDateFMT("yyyy-MM-DD", start_day), $lte: formatDateFMT("yyyy-MM-DD", end_day) }
        }).count();
    }
    myLogger.info(formatDateFMT("yyyy-MM-DD", day))
    myLogger.info("%o", info)
    ret = { statusCode: OK, data: { info } };
    return ret;
}
export async function getDashboard(start_day, end_day, tenant) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let topSourceIp = await getCountIP(start_day, end_day, tenant, 'source');
    let topDestIp = await getCountIP(start_day, end_day, tenant, 'destination');
    ret = { statusCode: OK, data: { topSourceIp, topDestIp } };

    return ret;
}
async function getCountIP(start_day, end_day, tenant, destination_type) {

    let today = new Date();
    myLogger.info("%o", { start_day, end_day, tenant, destination_type });
    let fromDate = start_day ? parseDate(start_day, 'yyyy-MM-DD').toDate() : new Date(today.setMonth(today.getMonth() - 1));
    let endDate = end_day ? parseDate(end_day, 'yyyy-MM-DD').toDate() : new Date(today.setDate(today.getDate() + 1));
    myLogger.info("%o", { endDate, fromDate });
    let andCondition = tenant ? [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        },

        { tenant },
        { 'direction_type': destination_type }
    ] : [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        },
        { 'direction_type': destination_type }];
    myLogger.info("%o", andCondition);
    let info = await Alert.aggregate([
        {
            "$match": {
                '$and': andCondition
            }
        },
        {
            "$group": {
                '_id': "$data",
                'count': { '$sum': 1 },
            }
        },
        {
            "$sort": {
                'count': -1
            }
        },

        { "$limit": 10 }
    ]);
    myLogger.info('%o', info);

    return info;
}


export async function getCountRule(start_day, end_day, tenant) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let today = new Date();
    myLogger.info("%o", { start_day, end_day, tenant });
    let fromDate = start_day ? parseDate(start_day, 'yyyy-MM-DD').toDate() : new Date(today.setMonth(today.getMonth() - 1));
    let endDate = end_day ? parseDate(end_day, 'yyyy-MM-DD').toDate() : new Date(today.setDate(today.getDate() + 1));
    myLogger.info("This is date new: %o", { fromDate, endDate });
    let andCondition = tenant ? [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        },
        { tenant },
    ] : [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        }
    ];
    myLogger.info("%o", andCondition);
    let info = await Alert.aggregate([
        {
            "$match": {
                '$and': andCondition
            }
        },
        {
            "$group": {
                '_id': "$alert_name",
                'count': { '$sum': 1 },
            }
        },
        {
            "$sort": {
                'count': -1
            }
        },

        { "$limit": 10 }
    ]);
    myLogger.info('%o', info);
    ret = { statusCode: OK, data: { info } };
    return ret;
}