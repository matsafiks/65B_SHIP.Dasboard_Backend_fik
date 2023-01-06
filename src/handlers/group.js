
import utilSetResponseJson from '../utils/util.SetResponseJson.js';
import Group from "../models/Group/Group.js";
import User from '../models/User/User.js';
import { permission } from '../preHandlers/permission.js';
import config from '../utils/config.js';
import axios from 'axios';
import sanitizeHtml from "sanitize-html";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const URL = require("url").URL

const all = async (req, res) => {

    try {

        await permission('62a595278b668a5509dbb1fd', req)

        let compare = 1
        //https://usaapi-test.pttplc.com/api/v1/application/3139e2c7-410f-477d-91f0-83b1dd1c7ae1/roles
        let api = new URL(config.auth_host + '/application/' + config.auth_app_id + '/roles')
        let group_auth = await axios.get(api.href, {
            headers: {
                'Authorization': config.auth_api_key
            }
        }).then(res => { return res.data }).catch(err => {
            console.log(err.message)
            compare = 0
        })

        if (compare == 1) {
            group_auth = group_auth.roles.map(el => { return el.id })

            let group_db = await Group.find()

            //compare
            let deleted = group_db.filter(el => { return !group_auth.includes(el.others.id) })

            if (deleted.length > 0) {
                await Group.deleteMany({ _id: { $in: deleted.map(el => { return el._doc._id }) } })

            }
        }


        let search = (req) ? req.query.search : undefined
        search = (search) ? {
            $or: [
                { group_name: { $regex: '.*' + search + '.*' } }
            ]
        } : {}

        let limit = (req.query.limit) ? req.query.limit : 10
        let page = (req.query.page) ? req.query.page : 1
        let sort = (req.query.sort) ? req.query.sort : 'group_id'
        let order = (req.query.order) ? req.query.order : 'asc'

        let data = await Group.find()
            .where(search)
            .skip(((page) - 1) * limit)
            .limit(limit)
            .sort((order == 'desc') ? '-' + sort : sort)
            .then((async (result) => {
                for (let index = 0; index < result.length; index++) {
                    const element = result[index];
                    if (element._doc.created_by) {
                        let created_by = await User.findOne().where({ _id: element._doc.created_by })
                        if (created_by)
                            result[index].created_by = created_by._doc.username
                    }
                }
                return result
            }))


        let len_data = await Group.count().where(search)


        data = {
            currentPage: page,
            pages: Math.ceil(len_data / limit),
            currentCount: data.length,
            totalCount: len_data,
            data: data

        }

        data = sanitizeHtml(JSON.stringify(data))
        data = JSON.parse(data)
        return res.send(utilSetResponseJson('success', data))
    } catch (error) {
        return res.send(utilSetResponseJson('failed', error.toString()))
    }
}
const byid = async (req, res) => {
    try {

        await permission('62a595278b668a5509dbb1fd', req)


        let data = await Group.find()
            .where({ _id: req.params._id })
            .then((async (result) => {
                for (let index = 0; index < result.length; index++) {
                    const element = result[index];
                    if (element._doc.created_by) {
                        let created_by = await User.findOne().where({ _id: element._doc.created_by })
                        if (created_by)
                            result[index].created_by = created_by._doc.username
                    }
                }
                return result[0]
            }))
        if (!data) {
            return res.send(utilSetResponseJson("failed", 'data not found'))
        }
        data = sanitizeHtml(JSON.stringify(data))
        data = JSON.parse(data)
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

        await permission('62a595278b668a5509dbb1fd', req)

        if (!req.body.group_id) {
            let group_id = await Group.findOne().sort({ group_id: -1 }).select('group_id')
            if (group_id) {
                req.body.group_id = group_id.group_id + 1
            } else {
                req.body.group_id = 1
            }
        }
        let status = (req.body.status != undefined) ? req.body.status : 1


        // add role in authen systen
        let api = new URL(config.auth_host + '/application/' + config.auth_app_id + '/role')
        let add_role = await axios.post(api.href,
            {
                role: req.body.others
            },
            {
                headers: {
                    'Authorization': config.auth_api_key
                }
            }
        ).then(res => {
            return res.data
        }).catch(err => {
            if (err.response.data.fieldErrors['role.name'][0].code == '[duplicate]role.name') {
                throw new Error("others.name duplicate")

            }
            throw new Error(err.toString())
        })

        let data = await Group.create(
            {
                ...req.body,
                status: status,
                others: add_role.role,
                created_by: req._id,
                created_date: new Date()
            })
        data = sanitizeHtml(JSON.stringify(data))
        data = JSON.parse(data)
        if (res)
            return res.send(utilSetResponseJson('success', data))
        return utilSetResponseJson('success', data)
    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson('failed', error.toString()))
        return utilSetResponseJson('failed', error.toString())
    }
}

const edit = async (req, res) => {

    try {
        await permission('62a595278b668a5509dbb1fd', req)

        // put role in authen systen
        if (req.body.others) {
            let api = new URL(config.auth_host + '/application/' + config.auth_app_id + '/role/' + req.body.others.id)
            let put_role = await axios.put(api.href,
                {
                    role: req.body.others
                },
                {
                    headers: {
                        'Authorization': config.auth_api_key
                    }
                }
            ).catch(err => {
                throw new Error(err.toString())
            })
        }

        delete req.body.created_by
        delete req.body.created_date

        await Group.updateOne(
            { _id: req.params._id.toString() },
            {
                ...req.body,
                updated_by: req._id,
                updated_date: new Date()
            })

        let data = await Group.findOne()
            .where({ _id: req.params._id.toString() })
        if (!data) {
            return res.send(utilSetResponseJson("failed", 'data not found'))
        }
        data = sanitizeHtml(JSON.stringify(data))
        data = JSON.parse(data)
        return res.send(utilSetResponseJson('success', data))

    } catch (error) {
        return res.send(utilSetResponseJson('failed', error.toString()))
    }

}

const destroy = async (req, res) => {
    try {
        let data = await Group.findOne()
            .where({ _id: req.params._id })
        if (!data) {
            return res.send(utilSetResponseJson("failed", 'data not found'))
        }

        // delete role in authen systen
        let api = new URL(config.auth_host + '/application/' + config.auth_app_id + '/role/' + data.others.id)
        let delete_roll = await axios.delete(api.href,
            {
                headers: {
                    'Authorization': config.auth_api_key
                }
            }
        ).catch(err => {
            throw new Error(err.toString())
        })

        await Group.deleteOne(
            { _id: req.params._id })

        return res.send(utilSetResponseJson('success', 'success'))

    } catch (error) {
        return res.send(utilSetResponseJson('failed', error.toString()))
    }
}

export { all, byid, add, edit, destroy };
