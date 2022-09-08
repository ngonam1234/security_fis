import { OK, SYSTEM_ERROR } from "../../constant/HttpResponseCode.js";
import User from "../../models/User.js";
import myLogger from "../../winstonLog/winston.js";
import bcrypt from 'bcrypt';
import {v1 as uuidv1} from 'uuid'

export async function getAllUser(start_day, end_day, tenant) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };

    let info = await User.find({});
    myLogger.info("%o", info)
    ret = { statusCode: OK, data: { info } };
    return ret;

}



export async function createUser(email, fullname, is_active, password, phone, role, telegram, tier) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };

    let model = new User({
        id: uuid.v1(),
        fullname: fullname,
        email: email,
        password: await bcrypt.hash(password, await bcrypt.genSalt(10)),
        is_active: is_active,
        role: role,
        tier: tier,
        create_time: new Date(),
        phone: phone,
        telegram: telegram
    })
    model.save();

    myLogger.info("%o", model)
    ret = { statusCode: OK, data: { model } };
    return ret;

}