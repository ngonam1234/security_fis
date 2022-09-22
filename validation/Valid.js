import { verifyExists } from "./ValidationUtil.js";


export function loginValidate(req, res, next) {
    let { code, name } = req.body;
    let v = verifyExists(code);
    if (v) return next(v);
    v = verifyExists(name);
    if (v) return next(v);
    return next();
}


export function createUserValid(req, res, next) {
    let { email, fullname, password, phone, role, telegram, tier, tenant } = req.body;
    let v = verifyExists(email);
    if (v) return next(v);
    v = verifyExists(fullname);
    if (v) return next(v);
    v = verifyExists(password);
    if (v) return next(v);
    v = verifyExists(phone);
    if (v) return next(v);
    v = verifyExists(role);
    if (v) return next(v);
    v = verifyExists(telegram);
    if (v) return next(v);
    v = verifyExists(tier);
    if (v) return next(v);
    v = verifyExists(tenant);
    if (v) return next(v);
    return next();
}


export function createTicketByAlert(req, res, next) {
    let { severity, owners } = req.body;
    let v = verifyExists(severity);
    if (v) return next(v);
    v = verifyExists(owners);
    if (v) return next(v);
    return next();
}