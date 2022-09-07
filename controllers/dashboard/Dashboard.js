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
    let topSourceIp = await getCountIP(start_day, end_day, tenant, 'source', '$data');
    let topDestIp = await getCountIP(start_day, end_day, tenant, 'destination', '$data');
    let topRules1 = await getCountRule1(start_day, end_day, tenant);
    let topRules2 = await getCountRule2(start_day, end_day, tenant);
    let topRules = topRules1.concat(topRules2);
    topRules.sort((a, b) => b.count - a.count);
    ret = { statusCode: OK, data: { topSourceIp, topDestIp, topRules } };

    return ret;
}
async function getCountIP(start_day, end_day, tenant, destination_type, type) {

    let today = new Date();
    myLogger.info("%o", { start_day, end_day, tenant, destination_type, type });
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
                '_id': type,
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


async function getCountRule1(start_day, end_day, tenant) {
    let today = new Date();
    myLogger.info("%o", { start_day, end_day, tenant });
    // let fromDate = start_day ? parseDate(start_day, 'yyyy-MM-DD').toDate() : new Date(today.setMonth(today.getMonth() - 1));
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
        { 'alert_detail._alert_watchlist_name': { "$ne": null } },
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
                '_id': "$alert_detail._alert_watchlist_name",
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
    return info;
}
async function getCountRule2(start_day, end_day, tenant) {
    let today = new Date();
    myLogger.info("%o", { start_day, end_day, tenant });
    // let fromDate = start_day ? parseDate(start_day, 'yyyy-MM-DD').toDate() : new Date(today.setMonth(today.getMonth() - 1));
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
        { 'alert_detail.description': { "$ne": null } },
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
                '_id': "$alert_detail.description",
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
    return info;
}

let tenant =
    [
        { code: '4thaiduong' },
        { code: '4tsoctrang' },
        { code: 'bdi' },
        { code: 'bsr' },
        { code: 'bvb' },
        { code: 'csd' },
        { code: 'csvc' },
        { code: 'egp' },
        { code: 'fis' },
        { code: 'hino' },
        { code: 'molisa' },
        { code: 'snz' },
        { code: 'vietlott' },
        { code: 'vib' },
        { code: 'slhb' },
        { code: 'lfvn' },
        { code: 'bgt' },
        { code: 'acb' },
        { code: 'wcm' }
    ]
export async function getAllTenant() {
    let ret = [];
    for (let t of tenant) {
        let { code } = t;
        ret.push({ code: code.toUpperCase() })
    }
    return { statusCode: OK, data: { tenants: ret } };
}

export async function getIncidentTotal(start_day, end_day, tenant) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let topSeverity = await getIncident(start_day, end_day, tenant, '$severity');
    let topIsClosed = await getIncident(start_day, end_day, tenant, '$is_closed');
    ret = { statusCode: OK, data: { topSeverity, topIsClosed } };
    return ret;
}

async function getIncident(start_day, end_day, tenant, type) {
    let today = new Date();
    myLogger.info("get if incident: %o", { start_day, end_day, tenant, type });
    // let fromDate = start_day ? parseDate(start_day, 'yyyy-MM-DD').toDate() : new Date(today.setMonth(today.getMonth() - 1));
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
    let info = await Ticket.aggregate([
        {
            "$match": {
                '$and': andCondition
            }
        },
        {
            "$group": {
                '_id': type,
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
    return info;
}