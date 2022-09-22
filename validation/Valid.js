import { verifyExists } from "./ValidationUtil.js";


export function loginValidate(req, res, next) {
    let { code, name } = req.body;
    let v = verifyExists(code);
    if (v) return next(v);
    v = verifyExists(name);
    if (v) return next(v);
    return next();
}