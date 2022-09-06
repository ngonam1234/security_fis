import express from 'express';
import mongoose from "mongoose";
import myLogger from "./winstonLog/winston.js";
import dotenv from 'dotenv';
import cors from 'cors';
import alertAPI from './routers/MainRouters.js';
import { BAD_REQUEST, CREATED, NO_CONTENT, OK } from './constant/HttpResponseCode.js';
dotenv.config();
const app = express();
app.use(cors());
const dbname = process.env.DBNAME;
const host = process.env.HOST;
const port = process.env.PORT;
const user = process.env.USER;
const pass = process.env.PASSWORD;


app.use('/api/', alertAPI);

app.use((data, req, res, next) => {
    let statusCode = data.statusCode;
    // myLogger.info(data)
    if (statusCode !== OK && statusCode !== CREATED && statusCode !== NO_CONTENT) {
        let { method, url } = req;
        // myLogger.info("Method:" + method + ", URl:" + url + ", Error: " + JSON.stringify(data), { label: "RESPONSE-ERROR" });
        res.status(statusCode || BAD_REQUEST).send({
            code: statusCode,
            error: data.data ? data.data : data.error,
            description: data.description
        })
    } else {
        let { method, url } = req;
        // myLogger.info("Method:" + method + ", URl:" + url + ", Data: %o", data.data, { label: "RESPONSE-OK" });
        // myLogger.info("Method:" + method + ", URl:" + url + ", Data: " + JSON.stringify(data.data), { label: "RESPONSE-OK" });
        res.status(statusCode).send(data.data)
    }
});


const dburl = `mongodb://${user}:${pass}@${host}:${port}/${dbname}?serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=${dbname}&authMechanism=SCRAM-SHA-256`
mongoose.connect(dburl,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        if (err) {
            myLogger.info(err)
        } else {
            myLogger.info("OK")
        }
    })
const portNode = process.env.PORTNODE || 3000
const host_node = '0.0.0.0';
function myListener() {
    myLogger.info(`Listening on port ${portNode}..`);
}
app.listen(portNode, host_node, myListener)