
import utilSetResponseJson from '../utils/util.SetResponseJson.js';
import Group from "../models/Group/Group.js";
import _ from 'lodash'
import moment from 'moment-timezone';
import { generateHashPassword } from '../utils/function.js';
import { permission } from '../preHandlers/permission.js';
import config from '../utils/config.js';
import axios from 'axios';
import Logs from '../models/Logs/Logs.js';

const all = async (req, res) => {

    try {

        // await permission('62a594d7bb8946576769c6a7', req)


        var search = (req) ? req.query.search : undefined
        search = (search) ? {
            $or: [
                { username: { $regex: '.*' + search + '.*' } },
                { url: { $regex: '.*' + search + '.*' } },
                { aciton: { $regex: '.*' + search + '.*' } },
                { error: { $regex: '.*' + search + '.*' } },

            ]
        } : {}

        var limit = req.query.limit || 10
        var page = req.query.page || 1
        var sort = req.query.sort || 'username'
        var order = req.query.order || 'asc'

        var data = await Logs.find()
            .where(search)
            .skip(((page) - 1) * limit)
            .limit(limit)
            .sort((order == 'desc') ? '-' + sort : sort)
            .then((async (result) => {
                // for (let index = 0; index < result.length; index++) {
                //     const element = result[index];
                //     delete element._doc.password
                //     if (element._doc.group_id) {
                //         var group_id = await Group.findOne().where({ _id: element._doc.group_id })
                //         if (group_id)
                //             result[index]._doc.group_id = {
                //                 group_name: group_id._doc.group_name,
                //                 group_id: group_id._doc.group_id
                //             }
                //         var created_by = await User.findOne().where({ _id: element._doc.created_by })
                //         if (created_by)
                //             result[index]._doc.created_by = created_by._doc.username
                //     }
                // }
                return result
            }))


        var len_data = await Logs.count().where(search)


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


export { all };
