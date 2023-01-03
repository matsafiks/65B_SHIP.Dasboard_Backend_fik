import mongoose from 'mongoose'
import fs from "fs";
import config from './config.js'
import Logs from '../models/Logs/Logs.js';
// import tunnel from 'tunnel-ssh';

var insert_log = async (req, action, error) => {

    var fullUrl = ' '
    var username = ' '
    if (req.username) {
        fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        username = req.username
    }


    await Logs.create({
        username: username,
        url: fullUrl,
        action: action,
        qeury: req.qeury,
        body: req.body,
        params: req.params,
        error: error,
        created_date: new Date(),
        created_by: req._id

    })
}

export default insert_log

