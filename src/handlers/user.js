
import utilSetResponseJson from '../utils/util.SetResponseJson.js';
import Group from "../models/Group/Group.js";
import _ from 'lodash'
import moment from 'moment-timezone';
import User from '../models/User/User.js';
import { generateHashPassword } from '../utils/function.js';
import { permission } from '../preHandlers/permission.js';
import config from '../utils/config.js';
import axios from 'axios';
import { compare_user } from '../utils/schedule_func.js'
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const URL = require("url").URL

const all = async (req, res) => {

    try {

        await permission('62a594d7bb8946576769c6a7', req)

        compare_user()

        var search = (req) ? req.query.search : undefined
        search = (search) ? {
            $or: [
                { username: { $regex: '.*' + search + '.*' } },
                { id: { $regex: '.*' + search + '.*' } },
                { email: { $regex: '.*' + search + '.*' } },
                { 'others.fname': { $regex: '.*' + search + '.*' } },
                { 'others.lname': { $regex: '.*' + search + '.*' } }
            ]
        } : {}

        var limit = req.query.limit || 10
        var page = req.query.page || 1
        var sort = req.query.sort || 'username'
        var order = req.query.order || 'asc'


        var data = await User.find()
            .where(search)
            .skip(((page) - 1) * limit)
            .limit(limit)
            .sort((order == 'desc') ? '-' + sort : sort)
            .then((async (result) => {
                for (let index = 0; index < result.length; index++) {
                    const element = result[index];
                    delete element._doc.password
                    if (element._doc.group_id) {
                        var group_id = await Group.findOne().where({ _id: element._doc.group_id })
                        if (group_id)
                            result[index]._doc.group_id = {
                                group_name: group_id._doc.group_name,
                                group_id: group_id._doc.group_id,
                                _id: group_id._doc._id

                            }
                        var created_by = await User.findOne().where({ _id: element._doc.created_by })
                        if (created_by)
                            result[index]._doc.created_by = created_by._doc.username
                    }
                }
                return result
            }))


        var len_data = await User.count().where(search)


        var data = {
            currentPage: page,
            pages: Math.ceil(len_data / limit),
            currentCount: data.length,
            totalCount: len_data,
            data: data

        }

        if (res)
            return res.send(utilSetResponseJson('success', data))
        return utilSetResponseJson('success', data)
    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson('failed', error.toString()))
        return utilSetResponseJson('failed', error.toString())
    }
}
const byid = async (req, res) => {
    try {

        await permission('62a594d7bb8946576769c6a7', req)

        var data = await User.find()
            .where({ _id: req.params._id })
            .then((async (result) => {
                for (let index = 0; index < result.length; index++) {
                    const element = result[index];
                    delete element._doc.password
                    if (element._doc.group_id) {
                        var group_id = await Group.findOne().where({ _id: element._doc.group_id })
                        if (group_id)
                            result[index]._doc.group_id = {
                                group_name: group_id._doc.group_name,
                                group_id: group_id._doc.group_id,
                                _id: group_id._doc._id

                            }
                        var created_by = await User.findOne().where({ _id: element._doc.created_by })
                        if (created_by)
                            result[index]._doc.created_by = created_by._doc.username
                    }
                }
                return result[0]
            }))
        if (!data) {
            return res.send(utilSetResponseJson("failed", 'data not found'))
        }
        if (res)
            return res.send(utilSetResponseJson('success', data))
        return utilSetResponseJson('success', data)
    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson('failed', error.toString()))
        return utilSetResponseJson('failed', error.toString())
    }
}
const add = async (req, res) => {
    try {


        await permission('62a594d7bb8946576769c6a7', req)

        if (req.body.group_id) {
            var check = await Group.findOne().where({ _id: req.body.group_id })
            if (!check) {
                throw 'group_id not found'
            }
        }
        var status = (req.body.status != undefined) ? req.body.status : 1

        // add user in authen systen
        var api = new URL(config.auth_host + '/user/registration')
        var add_user = await axios.post(api.href,
            {
                "registration": {
                    "applicationId": config.auth_app_id
                },
                "user": {
                    "username": req.body.username,
                    "password": req.body.password,
                    "data": req.body.others

                }
            },
            {
                headers: {
                    'Authorization': config.auth_api_key
                }
            }
        ).then(res => {
            return res.data
        }).catch(err => {
            throw err.response.data
        })

        if (req.body.group_id) {

            var group = check

            var api = new URL(config.auth_host + '/application/' + config.auth_app_id)
            var application = await axios.get(api.href,
                {
                    headers: {
                        'Authorization': config.auth_api_key
                    }
                }
            )
            var group_other_id = application.data.application.roles.filter(el => { return el.id == group.others.id })

            var api = new URL(config.auth_host + '/user/registration/' + add_user.user.id + '/' + config.auth_app_id)
            await axios.put(api.href,
                {
                    "registration": {
                        "applicationId": config.auth_app_id,
                        "roles": [
                            group_other_id[0].name
                        ]
                    }
                },
                {
                    headers: {
                        'Authorization': config.auth_api_key
                    }
                }
            ).then(res => {
                return res.data
            }).catch(err => {
                throw err.response.data
            })

        } else {
            var group = await Group.findOne().where({ "others.name": add_user.registration.roles[0] })
            req.body.group_id = group._id
        }
        var data = await User.create(
            {
                ...req.body,
                password: await generateHashPassword(req.body.password),
                id: add_user.user.id,
                status: status,
                created_by: req._id,
                created_date: new Date()
            })
        if (res)
            return res.send(utilSetResponseJson('success', data))
        return utilSetResponseJson('success', data)
    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson('failed', error))
        return utilSetResponseJson('failed', error)
    }
}

const edit = async (req, res) => {

    try {


        await permission('62a594d7bb8946576769c6a7', req)
        var data = await User.findOne().where({ _id: req.params._id })
        if (!data) {
            return res.send(utilSetResponseJson("failed", 'data not found'))
        }
        if (req.body.group_id) {
            var check = await Group.findOne().where({ _id: req.body.group_id })
            if (!check) {
                throw 'group_id not found'
            }
        }

        var put_user = {}

        if (req.body.others) {
            var api = new URL(config.auth_host + '/user/' + data.id)
            var put_user_ = await axios.patch(api.href,
                {
                    "applicationId": config.auth_app_id,
                    "user": {
                        "data": req.body.others
                    }
                },
                {
                    headers: {
                        'Authorization': config.auth_api_key
                    }
                }
            ).then(res => {
                return res.data
            }).catch(err => {
                throw err.response.data
            })

            put_user.others = put_user_.user.data
        }

        if (req.body.group_id) {
            var group = check

            var api = new URL(config.auth_host + '/application/' + config.auth_app_id)
            var application = await axios.get(api.href,
                {
                    headers: {
                        'Authorization': config.auth_api_key
                    }
                }
            )
            var group_other_id = application.data.application.roles.filter(el => { return el.id == group.others.id })

            var api = new URL(config.auth_host + '/user/registration/' + data.id + '/' + config.auth_app_id)
            await axios.put(api.href,
                {
                    "registration": {
                        "applicationId": config.auth_app_id,
                        "roles": [
                            group_other_id[0].name
                        ]
                    }
                },
                {
                    headers: {
                        'Authorization': config.auth_api_key
                    }
                }
            ).then(res => {
                return res.data
            }).catch(err => {
                throw err.response.data
            })

        }

        await User.updateOne(
            { _id: req.params._id },
            {
                ...req.body,
                ...put_user,
                updated_by: req._id,
                updated_date: new Date()
            })

        data = await User.findOne().where({ _id: req.params._id })

        return res.send(utilSetResponseJson('success', data))

    } catch (error) {
        return res.send(utilSetResponseJson('failed', error))
    }

}

const destroy = async (req, res) => {
    try {

        await permission('62a594d7bb8946576769c6a7', req)

        var data = await User.findOne().where({ _id: req.params._id })
        if (!data) {
            return res.send(utilSetResponseJson("failed", 'data not found'))
        }
        var api = new URL(config.auth_host + '/user/' + data.id)
        await axios.delete(api.href,
            {
                headers: {
                    'Authorization': config.auth_api_key
                }
            }
        ).then(res => {
            return res.data
        }).catch(err => {
            throw err.response.data
        })

        await User.deleteOne(
            { _id: req.params._id })

        return res.send(utilSetResponseJson('success', 'success'))

    } catch (error) {
        return res.send(utilSetResponseJson('failed', error))
    }
}

export { all, byid, add, edit, destroy };
