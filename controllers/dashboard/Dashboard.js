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
    let topRules = await getCountRule(start_day, end_day, tenant);
    // let topRules2 = await getCountRule2(start_day, end_day, tenant);
    // let topRules = topRules1.concat(topRules2);
    // topRules.sort((a, b) => b.count - a.count);
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


async function getCountRule(start_day, end_day, tenant) {
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
                '_id': "$rule_name",
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
        {
            id: '$All',
            name: "All"
        },
        {
            id: '4thaiduong',
            name: "sở TTTT Hải Dương"
        },
        {
            id: '4tsoctrang',
            name: "sở TTTT Sóc Trăng"
        },
        {
            id: 'bdi',
            name: "no name"
        },
        {
            id: 'bsr',
            name: "no name"
        },
        {
            id: 'bvb',
            name: "Ngân hàng TMCP Bản Việt "
        },
        {
            id: 'csvc',
            name: "China Steel And Nippon Steel Vietnam Joint Stock Company"
        },
        {
            id: 'egp',
            name: "hệ thống đấu thầu điện tử EGP"
        },
        {
            id: 'fis',
            name: "FPT IS"
        },
        {
            id: 'hino',
            name: "no name"
        },
        {
            id: 'molisa',
            name: "Bộ Lao động- Thương binh và Xã hội"
        },
        {
            id: 'snz',
            name: "sonadezi"
        },
        {
            id: 'vietlott',
            name: "Vietlott"
        },
        {
            id: 'vib',
            name: "Ngân hàng Quốc Tế VIB"
        },
        {
            id: 'slhb',
            name: "Ngân hàng LHB"
        },
        {
            id: 'lfvn',
            name: "Lotte Finance Vietnam"
        },
        {
            id: 'bgt',
            name: "Berjaya Gia Thịnh"
        },
        {
            id: 'acb',
            name: "Ngân hàng thương mại cổ phần Á Châu"
        },
        {
            id: 'wcm',
            name: "WINCOMMERCE"
        }
    ]
export async function getAllTenant() {
    let ret = [];
    for (let t of tenant) {
        let { id, name } = t;
        ret.push({ id: id.toUpperCase(), name })
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

