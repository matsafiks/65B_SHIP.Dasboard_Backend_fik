

import utilSetResponseJson from '../utils/util.SetResponseJson.js';
import socket_io from "../utils/socket_io.js";
import moment from 'moment-timezone';
import User from "../models/User/User.js";
import { generateHashPassword, utilComparePassword } from "../utils/function.js";
import fs from 'fs'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import _ from 'lodash'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import config from "../utils/config.js";
import Group from '../models/Group/Group.js';
import Application from '../models/Application/Application.js';
import Role from '../models/Role/Role.js';
import WorkPermit from '../models/WorkPermit/WorkPermit.js';
import { createRequire } from "module";
import { permission } from '../preHandlers/permission.js';
import { check_notification } from '../utils/check_notification.js'
import sanitizeHtml from "sanitize-html";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
// var user_sam = require("../utils/user_sam.json")
const uuid = require("uuid");

const dateThailand = moment.tz(Date.now(), "Asia/Bangkok");
const URL = require("url").URL

const login = async (req, res) => {
    const privateKey = fs.readFileSync(__dirname + '/../utils/private.key')

    try {

        var data = req.body
        var test = []

        var success = true

        var api = new URL(config.auth_host + '/login')
        var login = await axios.post(api.href,
            {
                loginId: data.username,
                password: data.password,
                applicationId: config.auth_app_id
            },
            {
                headers: {
                    'Authorization': config.auth_api_key
                }
            }
        ).then(res => {
            return res.data
        }).catch(async err => {
            if (err.response) {
                if (err.response.data.statusCode == 404) {
                    res.statusCode = 400
                    throw 'Unauthorized'
                }
            }

            // swith to own login
            success = false
        })


        if (success == false) {
            var data = await own_login(req.body)
            data = sanitizeHtml(JSON.stringify(data))
            return res.send(utilSetResponseJson("success", JSON.parse(data)))

        }



        var role = login.user.registrations.filter(el => { return el.applicationId == config.auth_app_id })

        if (role.length == 0) {

            //register
            var api = new URL(config.auth_host + '/user/registration/' + login.user.id)
            await axios.post(api.href,
                {
                    registration: {
                        applicationId: config.auth_app_id
                    }
                },
                {
                    headers: {
                        'Authorization': config.auth_api_key
                    }
                }
            )


            login = await add_role(data, login)

        } else if (!role[0].roles) {

            login = await add_role(data, login)

        }

        role = login.user.registrations.filter(el => { return el.applicationId == config.auth_app_id })
        var api = new URL(config.auth_host + '/application/' + config.auth_app_id)
        var application = await axios.get(api.href,
            {
                headers: {
                    'Authorization': config.auth_api_key
                }
            }
        )

        var group_other_id = application.data.application.roles.filter(el => { return el.name == role[0].roles[0] })


        var group_id = await Group.findOne().where({ "others.id": group_other_id[0].id })

        if (!group_id) {
            res.statusCode = 403
            throw 'Forbidden'
        }


        var others = {
            fname: (login.user.firstName) ? login.user.firstName : (login.user.data.fname) ? login.user.data.fname : '',
            lname: (login.user.lastName) ? login.user.lastName : (login.user.data.lname) ? login.user.data.lname : '',

            code: login.user.data.employeeid,
            employeeid: login.user.data.employeeid
        }

        login.user.data = { ...login.user.data, ...others }

        var check = await User.findOne().where({ id: login.user.id })
        if (!check) {
            var check = await User.create({
                username: data.username,
                status: 1,
                group_id: group_id._id,
                id: login.user.id,
                others: others,
                email: (login.user.email) ? login.user.email : null,
                login_status: true,
                created_date: new Date()
            })

        } else {
            await User.updateOne({ _id: check._id }, {
                others: others,
                email: (login.user.email) ? login.user.email : null,
                group_id: group_id._id,
                login_status: true,
            })

        }



        var data = {
            username: data.username,
            access_token: login.token,
            expires_at: Math.floor(login.tokenExpirationInstant / 1000),
            expires_in: Math.floor((login.tokenExpirationInstant - new Date().getTime()) / 1000),
            token_type: "Bearer",
            tokenExpirationInstant: login.tokenExpirationInstant,
            user: login.user
        }

        var data_ = {
            Status: 'success',
            Message: data
        }
        if (group_id.others.id == config.ptt_group_id && !login.user.data.employeeid) {
            data_.MessageAlert = 'ไม่พบรหัสพนักงานผู้ควบคุมงานของคุณในระบบ กรุณาทำการค้นหาข้อมูลที่ต้องการ'
        }
        data_ = sanitizeHtml(JSON.stringify(data_))
        res.send(JSON.parse(data_))

    } catch (error) {
        error = error.toString()
        res.send(utilSetResponseJson('failed', error))
    }
}

const loginAd = async (req, res) => {
    const privateKey = fs.readFileSync(__dirname + '/../utils/private.key')

    try {

        var data = req.body
        var test = []

        var success = true
        var api = new URL(config.auth_host + '/login/ad')
        var login = await axios.post(api.href,
            {
                loginId: data.username,
                applicationId: config.auth_app_id
            },
            {
                headers: {
                    'Authorization': config.auth_api_key
                }
            }
        ).then(res => {
            return res.data
        }).catch(err => {
            if (err.response) {
                if (err.response.data.statusCode == 404) {
                    res.statusCode = 400
                    throw 'Unauthorized'
                }
            }

            // switch to own login
            success = false
        })

        if (success == false) {
            var data = await own_login(req.body)
            data = sanitizeHtml(JSON.stringify(data))
            return res.send(utilSetResponseJson("success", JSON.parse(data)))

        }

        var role = login.user.registrations.filter(el => { return el.applicationId == config.auth_app_id })

        /**
        * ผู้ควบคุมงาน ปตท.
        */
        var group = config.ptt_group_id

        if (role.length == 0) {

            //register
            var api = new URL(config.auth_host + '/user/registration/' + login.user.id)
            await axios.post(api.href,
                {
                    registration: {
                        applicationId: config.auth_app_id
                    }
                },
                {
                    headers: {
                        'Authorization': config.auth_api_key
                    }
                }
            )

            login = await add_role(data, login, group)

        } else if (!role[0].roles) {

            login = await add_role(data, login, group)

        }

        role = login.user.registrations.filter(el => { return el.applicationId == config.auth_app_id })

        var api = new URL(config.auth_host + '/application/' + config.auth_app_id)
        var application = await axios.get(api.href,
            {
                headers: {
                    'Authorization': config.auth_api_key
                }
            }
        )

        var group_other_id = application.data.application.roles.filter(el => { return el.name == role[0].roles[0] })


        var group_id = await Group.findOne().where({ "others.id": group_other_id[0].id })

        if (!group_id) {
            res.statusCode = 403
            throw 'Forbidden'
        }

        var others = {
            fname: (login.user.firstName) ? login.user.firstName : (login.user.data.fname) ? login.user.data.fname : '',
            lname: (login.user.lastName) ? login.user.lastName : (login.user.data.lname) ? login.user.data.lname : '',

            code: login.user.data.employeeid,
            employeeid: login.user.data.employeeid
        }
        login.user.data = { ...login.user.data, ...others }
        var check = await User.findOne().where({ id: login.user.id })
        if (!check) {
            var check = await User.create({
                username: data.username,
                status: 1,
                group_id: group_id._id,
                id: login.user.id,
                others: others,
                login_status: true,
                created_date: new Date()
            })

        } else {
            await User.updateOne({ _id: check._id }, {
                username: data.username,
                others: others,
                group_id: group_id._id,
                login_status: true,
            })

        }

        var data = {
            username: data.username,
            access_token: login.token,
            expires_at: Math.floor(login.tokenExpirationInstant / 1000),
            expires_in: Math.floor((login.tokenExpirationInstant - new Date().getTime()) / 1000),
            token_type: "Bearer",
            tokenExpirationInstant: login.tokenExpirationInstant,
            user: login.user
        }

        var data_ = {
            Status: 'success',
            Message: data
        }
        if (group_id.others.id == config.ptt_group_id && !login.user.data.employeeid) {
            data_.MessageAlert = 'ไม่พบรหัสพนักงานผู้ควบคุมงานของคุณในระบบ กรุณาทำการค้นหาข้อมูลที่ต้องการ'
        }
        // res.send(utilSetResponseJson('success', data))
        data_ = sanitizeHtml(JSON.stringify(data_))
        res.send(JSON.parse(data_))

    } catch (error) {
        error = error.toString()
        res.send(utilSetResponseJson('failed', error))
    }
}

const add_role = async (data, login, group) => {
    try {
        //check default role
        var api = new URL(config.auth_host + '/application/' + config.auth_app_id)
        var application = await axios.get(api.href,
            {
                headers: {
                    'Authorization': config.auth_api_key
                }
            }
        )

        var roles = application.data.application.roles

        if (group != null) {
            var role = roles.filter(el => { return el.id == group })

        } else {
            var role = roles.filter(el => { return el.isDefault == true })
        }


        var api = new URL(config.auth_host + '/user/registration/' + login.user.id + '/' + config.auth_app_id)
        var add_role = await axios.put(api.href,
            {
                registration: {
                    applicationId: config.auth_app_id,
                    roles: [
                        role[0].name
                    ]
                }
            },
            {
                headers: {
                    'Authorization': config.auth_api_key
                }
            }
        )

        if (data.password) {
            var api = new URL(config.auth_host + '/login')
            var login = await axios.post(api.href,
                {
                    loginId: data.username,
                    password: data.password,
                    applicationId: config.auth_app_id
                },
                {
                    headers: {
                        'Authorization': config.auth_api_key
                    }
                }
            ).then(res => {
                return res.data
            })
        } else {
            var api = new URL(config.auth_host + '/login/ad')
            var login = await axios.post(api.href,
                {
                    loginId: data.username,
                    applicationId: config.auth_app_id
                },
                {
                    headers: {
                        'Authorization': config.auth_api_key
                    }
                }
            ).then(res => {
                return res.data
            })
        }


        return login
    } catch (error) {

        throw error
    }

}

const token = async (req, res) => {
    const privateKey = fs.readFileSync(__dirname + '/../utils/private.key')

    try {

        var grant_type = req.query.grant_type
        var client_id = req.query.client_id
        var client_secret = req.query.client_secret
        var refresh_token = req.query.refresh_token


        req.body.username = client_id
        req.body.password = client_secret
        return await login(req, res)


        // if (grant_type == 'client_credentials') {

        //     if (!client_id) {
        //         return res.send(utilSetResponseJson('failed',
        //             {
        //                 "query": [
        //                     {
        //                         "instancePath": "",
        //                         "schemaPath": "#/required",
        //                         "keyword": "required",
        //                         "params": {
        //                             "missingProperty": "client_id"
        //                         },
        //                         "message": "must have required property 'client_id'"
        //                     }
        //                 ]
        //             }))
        //     }
        //     if (!client_secret) {
        //         return res.send(utilSetResponseJson('failed',
        //             {
        //                 "query": [
        //                     {
        //                         "instancePath": "",
        //                         "schemaPath": "#/required",
        //                         "keyword": "required",
        //                         "params": {
        //                             "missingProperty": "client_secret"
        //                         },
        //                         "message": "must have required property 'client_secret'"
        //                     }
        //                 ]
        //             }))
        //     }



        //     var check = await User.findOne().where({ 'others.client_id': client_id, 'others.client_secret': client_secret })
        //     if (!check) {
        //         res.send(utilSetResponseJson('failed', 'Unauthorized'))
        //     }

        //     var xCurrentTime = Math.floor(Date.now() / 1000)
        //     const issuedAt = xCurrentTime
        //     const expirationTime = xCurrentTime + (config.config_access_oauth_token_expiration_time);

        //     const payload = {
        //         _id: check._id,
        //         username: check.username,
        //         iat: issuedAt,
        //         exp: expirationTime,
        //     }
        //     const token = jwt.sign(payload, privateKey);

        //     delete check._doc.password

        //     var refresh_token = uuid.v4()
        //     var exp = Date.now() + (config.config_refresh_oauth_token_expiration_time_oauth * 1000)
        //     var before_update = await User.findOne({
        //         _id: check._id
        //     })


        //     await User.findOneAndUpdate({ _id: check._id }, {
        //         login_status: true,
        //         others: {
        //             ...before_update.others,
        //             ...{
        //                 token_set: {
        //                     refresh_token: refresh_token,
        //                     exp: exp
        //                 }
        //             }
        //         }
        //     })

        //     var data = {
        //         username: check.username,
        //         access_token: token,
        //         expires_at: expirationTime,
        //         expires_in: config.config_access_token_expiration_time,
        //         refresh_token: refresh_token,
        //         token_type: 'Bearer'
        //     }

        //     data = sanitizeHtml(JSON.stringify(data))
        //     return res.send(utilSetResponseJson('success', JSON.parse(data)))

        // }

        // else if (grant_type == 'refresh_token') {

        //     var check = await User.findOne({
        //         'others.token_set.refresh_token': refresh_token
        //     })

        //     if (!check) {
        //         return res.send(utilSetResponseJson('failed', 'refresh_token not found'))
        //     }

        //     if (check.others.token_set.exp < new Date()) {
        //         return res.send(utilSetResponseJson('failed', 'refresh_token expired'))
        //     }

        //     var xCurrentTime = Math.floor(Date.now() / 1000)
        //     const issuedAt = xCurrentTime
        //     const expirationTime = xCurrentTime + (config.config_access_oauth_token_expiration_time);

        //     const payload = {
        //         _id: check._id,
        //         username: check.username,
        //         iat: issuedAt,
        //         exp: expirationTime,
        //     }
        //     const token = jwt.sign(payload, privateKey);

        //     delete check._doc.password

        //     var data = {
        //         username: check.username,
        //         access_token: token,
        //         expires_at: expirationTime,
        //         expires_in: config.config_access_token_expiration_time,
        //         token_type: 'Bearer'
        //     }

        //     data = sanitizeHtml(JSON.stringify(data))
        //     return res.send(utilSetResponseJson('success', JSON.parse(data)))
        // } else {
        //     return res.send(utilSetResponseJson('failed', "grant_type not allow"))

        // }

    } catch (error) {
        error = error.toString()
        res.send(utilSetResponseJson('failed', error))
    }
}
const logout = async (req, res) => {

    try {

        await User.findOneAndUpdate({ username: req.username }, {
            login_status: false
        })

        res.send(utilSetResponseJson('success', "success"))
    } catch (error) {
        error = error.toString()
        res.send(utilSetResponseJson('failed', error))
    }
}

const mydata = async (req, res) => {
    try {

        var application_id = '62a5eacea5f80f8ea3c9ddc5'
        await permission(application_id, req)

        // return res.send(req._id)
        var data = await User.findOne({ username: req.username })
        var check_notification_all = await check_notification(data._doc)
        var group_id = await Group.findOne().where({ _id: data._doc.group_id })
        if (group_id)
            data._doc.group_id = {
                group_name: group_id._doc.group_name,
                group_id: group_id._doc.group_id,
                _id: group_id._doc._id
            }
        var application_all = await Application.find()
        var role_all = await Role.find().where({ application_id: { $in: application_all.map(el => { return el._id }) }, group_id: group_id._doc._id })


        data._doc.role = await Application.find()
            .sort('order')
            .where({ parent_id: '' })
            .then((async (result) => {
                var result_ = []
                for (let index = 0; index < result.length; index++) {
                    const element = result[index]._doc;

                    var notification = false
                    notification = check_notification_all[element.url]

                    var check = role_all.filter((el) => { return el.application_id == element._id })
                    if (check.length > 0) {
                        element.get = check[0]._doc.get
                        element.put = check[0]._doc.put
                        element.post = check[0]._doc.post
                        element.delete = check[0]._doc.delete
                        element.notification = notification
                        element.child = application_all.filter((el) => {
                            el = el._doc
                            if (el.parent_id == element._id) {

                                var check = role_all.filter((el1) => { return el1.application_id == el._id })
                                if (check.length > 0) {
                                    el.get = check[0]._doc.get
                                    el.put = check[0]._doc.put
                                    el.post = check[0]._doc.post
                                    el.delete = check[0]._doc.delete
                                    el.child = application_all.filter((el1) => {
                                        el1 = el1._doc
                                        if (el1.parent_id == el._id) {
                                            var check = role_all.filter((el2) => { return el2.application_id == el1._id })
                                            if (check.length > 0) {
                                                el1.get = check[0]._doc.get
                                                el1.put = check[0]._doc.put
                                                el1.post = check[0]._doc.post
                                                el1.delete = check[0]._doc.delete
                                                return el1

                                            }
                                        }
                                    })
                                    return el
                                }
                            }
                        })

                        result_.push(element)
                    }

                }
                return result_
            }))

        var data_ = {
            Status: 'success',
            Message: data
        }
        if (group_id.others.id == config.ptt_group_id && !data.others.employeeid) {
            data_.MessageAlert = 'ไม่พบรหัสพนักงานผู้ควบคุมงานของคุณในระบบ กรุณาทำการค้นหาข้อมูลที่ต้องการ'
        }
        data_ = sanitizeHtml(JSON.stringify(data_))
        res.send(JSON.parse(data_))

    } catch (error) {
        error = error.toString()
        res.send(utilSetResponseJson('failed', error))
    }
}

const own_login = async (body) => {
    const privateKey = fs.readFileSync(__dirname + '/../utils/private.key')

    try {

        var check = await User.findOne().where({ $or: [{ username: body.username }, { email: body.username }] })
        if (!check) {
            throw 'Unauthorized'
        }



        var xCurrentTime = Math.floor(Date.now() / 1000)
        const issuedAt = xCurrentTime
        const expirationTime = xCurrentTime + (config.config_access_oauth_token_expiration_time);

        const payload = {
            _id: check._id,
            username: check.username,
            iat: issuedAt,
            exp: expirationTime,
        }
        const token = jwt.sign(payload, privateKey);

        delete check._doc.password

        // var refresh_token = uuid.v4()
        // var exp = Date.now() + (config.config_refresh_oauth_token_expiration_time_oauth * 1000)
        // var before_update = await User.findOne({
        //     _id: check._id
        // })

        await User.findOneAndUpdate({ _id: check._id }, {
            login_status: true
        })

        check._doc.data = check.others

        var data = {
            username: body.username,
            access_token: token,
            expires_at: expirationTime,
            expires_in: config.config_access_token_expiration_time,
            token_type: "Bearer",
            // tokenExpirationInstant: login.tokenExpirationInstant,
            user: check
        }


        return data
    } catch (error) {
        throw error.toString()
    }

}


const exampleLogin = async (req, res) => {

    // try {


    //     var username = req.body.username
    //     var password = req.body.password
    //     // var check = user_sam
    //     var check = user_sam.filter(function (el) {
    //         return el.Username == username &&
    //             el.Password == password
    //     });


    //     if (check.length == 0) {
    //         check = await User.find({ username: username })
    //         if (await utilComparePassword(password, check[0].password)) {
    //         } else {
    //             return res.send(utilSetResponseJson('failed', 'Unauthorized'))
    //         }
    //     }


    //     if (check.length == 0) {
    //         return res.send(utilSetResponseJson('failed', 'Unauthorized'))
    //     }
    //     res.send(utilSetResponseJson('success', check[0]))
    // } catch (error) {
    //     res.send(utilSetResponseJson('failed', error.toString()))
    // }
}

export { login, loginAd, token, logout, mydata, exampleLogin };
