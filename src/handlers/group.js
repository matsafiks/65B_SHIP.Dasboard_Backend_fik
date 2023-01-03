
import utilSetResponseJson from '../utils/util.SetResponseJson.js';
import Group from "../models/Group/Group.js";
import _ from 'lodash'
import moment from 'moment-timezone';
import User from '../models/User/User.js';
import { permission } from '../preHandlers/permission.js';
import config from '../utils/config.js';
import axios from 'axios';

const all = async (req, res) => {

    try {

        await permission('62a595278b668a5509dbb1fd', req)

        var compare = true
        //https://usaapi-test.pttplc.com/api/v1/application/3139e2c7-410f-477d-91f0-83b1dd1c7ae1/roles
        var group_auth = await axios.get(config.auth_host + '/application/' + config.auth_app_id + '/roles', {
            headers: {
                'Authorization': config.auth_api_key
            }
        }).then(res => { return res.data }).catch(err => {
            console.log(err.message)
            compare = false
        })

        if (compare == true) {
            group_auth = group_auth.roles.map(el => { return el.id })

            var group_db = await Group.find()

            //compare
            var deleted = group_db.filter(el => { return !group_auth.includes(el.others.id) })

            if (deleted.length > 0) {
                await Group.deleteMany({ _id: { $in: deleted.map(el => { return el._doc._id }) } })

            }
        }


        var search = (req) ? req.query.search : undefined
        search = (search) ? {
            $or: [
                { group_name: { $regex: '.*' + search + '.*' } }
            ]
        } : {}

        var limit = req.query.limit || 10
        var page = req.query.page || 1
        var sort = req.query.sort || 'group_id'
        var order = req.query.order || 'asc'

        var data = await Group.find()
            .where(search)
            .skip(((page) - 1) * limit)
            .limit(limit)
            .sort((order == 'desc') ? '-' + sort : sort)
            .then((async (result) => {
                for (let index = 0; index < result.length; index++) {
                    const element = result[index];
                    if (element._doc.created_by) {
                        var created_by = await User.findOne().where({ _id: element._doc.created_by })
                        if (created_by)
                            result[index].created_by = created_by._doc.username
                    }
                }
                return result
            }))


        var len_data = await Group.count().where(search)


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

        await permission('62a595278b668a5509dbb1fd', req)


        var data = await Group.find()
            .where({ _id: req.params._id })
            .then((async (result) => {
                for (let index = 0; index < result.length; index++) {
                    const element = result[index];
                    if (element._doc.created_by) {
                        var created_by = await User.findOne().where({ _id: element._doc.created_by })
                        if (created_by)
                            result[index].created_by = created_by._doc.username
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

        await permission('62a595278b668a5509dbb1fd', req)

        if (!req.body.group_id) {
            var group_id = await Group.findOne().sort({ group_id: -1 }).select('group_id')
            if (group_id) {
                req.body.group_id = group_id.group_id + 1
            } else {
                req.body.group_id = 1
            }
        }
        var status = (req.body.status != undefined) ? req.body.status : 1


        // add role in authen systen
        var add_role = await axios.post(config.auth_host + '/application/' + config.auth_app_id + '/role',
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
                throw 'others.name duplicate'
            }
            throw err.toString()
        })

        var data = await Group.create(
            {
                ...req.body,
                status: status,
                others: add_role.role,
                created_by: req._id,
                created_date: new Date()
            })
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
            var put_role = await axios.put(config.auth_host + '/application/' + config.auth_app_id + '/role/' + req.body.others.id,
                {
                    role: req.body.others
                },
                {
                    headers: {
                        'Authorization': config.auth_api_key
                    }
                }
            ).catch(err => {
                throw err.toString()
            })
        }

        delete req.body.created_by
        delete req.body.created_date

        await Group.updateOne(
            { _id: req.params._id },
            {
                ...req.body,
                updated_by: req._id,
                updated_date: new Date()
            })

        var data = await Group.findOne()
            .where({ _id: req.params._id })
        if (!data) {
            return res.send(utilSetResponseJson("failed", 'data not found'))
        }
        return res.send(utilSetResponseJson('success', data))

    } catch (error) {
        return res.send(utilSetResponseJson('failed', error.toString()))
    }

}

const destroy = async (req, res) => {
    try {
        var data = await Group.findOne()
            .where({ _id: req.params._id })
        if (!data) {
            return res.send(utilSetResponseJson("failed", 'data not found'))
        }

        // delete role in authen systen
        var delete_roll = await axios.delete(config.auth_host + '/application/' + config.auth_app_id + '/role/' + data.others.id,
            {
                headers: {
                    'Authorization': config.auth_api_key
                }
            }
        ).catch(err => {
            throw err.toString()
        })

        await Group.deleteOne(
            { _id: req.params._id })

        return res.send(utilSetResponseJson('success', 'success'))

    } catch (error) {
        return res.send(utilSetResponseJson('failed', error.toString()))
    }
}

export { all, byid, add, edit, destroy };
