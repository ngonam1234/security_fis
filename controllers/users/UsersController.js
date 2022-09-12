import { BAD_REQUEST, OK, SYSTEM_ERROR } from "../../constant/HttpResponseCode.js";
import User from "../../models/User.js";
import myLogger from "../../winstonLog/winston.js";
import bcrypt from 'bcrypt';
import { v1 as uuidv1, v1 } from 'uuid'
import { genRefreshTokenStaff, genTokenStaff } from "../../token/ValidateToken.js";

export async function getAllUser() {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let info = await User.find({}).sort({ create_time: -1 });
    myLogger.info("%o", info)
    ret = { statusCode: OK, data: { info } };
    return ret;

}



export async function createUser(email, fullname, is_active, password, phone, role, telegram, tier, tenant) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };

    let model = new User({
        id: v1(),
        fullname: fullname,
        email: email,
        password: await bcrypt.hash(password, await bcrypt.genSalt(10)),
        is_active: is_active,
        role: role,
        tier: tier,
        create_time: new Date(),
        phone: phone,
        telegram: telegram,
        tenant: tenant
    })
    model.save();

    myLogger.info("%o", model)
    ret = { statusCode: OK, data: { model } };
    return ret;

}

export async function update(filter, body) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let model = await User.findOneAndUpdate(
        filter, body, { new: true }
    )
    myLogger.info("%o", model)
    ret = { statusCode: OK, data: model };
    return ret;
}


export async function resetFirstLogin2FA(id) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let model = await User.findOneAndUpdate(
        { id }, { firstLogin2FA: null }, { new: true }
    )

    myLogger.info("%o", model)
    ret = { statusCode: OK, data: model };
    return ret;
}

export async function changePassword(id, oldPass, newPass) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let model = await User.findOne(
        { id }
    )
    myLogger.info("%o", { model, oldPass, newPass, id })
    let { password } = model;
    let verify = bcrypt.compareSync(oldPass, password);

    if (verify == true) {
        await update({ id }, { password: await bcrypt.hash(newPass, await bcrypt.genSalt(10)) })
        ret = { statusCode: OK, data: { status: 'Success' } };
    } else {
        ret = { statusCode: BAD_REQUEST, data: { status: 'Faild: Password not match' } };

    }
    return ret;
}

export async function login(emailtxt, passwordtxt) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let model = await User.findOne(
        { email: emailtxt }
    )
    let { password, roleCode, tenant, permissions, fullname, username, email } = model;
    myLogger.info("%o", { model, email, password, roleCode, tenant, permissions, fullname, username, email })
    if (model) {
        let verify = bcrypt.compareSync(passwordtxt, password);
        if (verify) {
            let accessToken = genTokenStaff({password, roleCode, tenant, permissions, fullname, username, email});
            let refreshToken = genRefreshTokenStaff({password, roleCode, tenant, permissions, fullname, username, email});
            ret = { statusCode: OK, data: { status: 'Login Success', accessToken, refreshToken } };
        } else {
            ret = { statusCode: BAD_REQUEST, data: { status: 'Faild: Password or email not match' } };
        }
    }
    else {
        ret = { statusCode: BAD_REQUEST, data: { status: 'Bad Request' } };

    }
    return ret;
}