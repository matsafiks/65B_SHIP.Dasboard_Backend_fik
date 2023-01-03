
import utilSetResponseJson from '../utils/util.SetResponseJson.js';
import WorkpermitStatus from "../models/Master/WorkpermitStatus/WorkpermitStatus.js";
import _ from 'lodash'
import moment from 'moment-timezone';
import User from '../models/User/User.js';

const all = async (req, res) => {

    try {

        var search = (req) ? req.query.search : undefined
        search = (search) ? {
            $or: [
                { Status_ID: { $regex: '.*' + search + '.*' } },
                { Status_Name: { $regex: '.*' + search + '.*' } },
                { Status_Desc: { $regex: '.*' + search + '.*' } }
            ]
        } : {}

        var limit = req.query.limit || 10
        var page = req.query.page || 1
        var sort = req.query.sort || 'Status_ID'
        var order = req.query.order || 'asc'

        var data = await WorkpermitStatus.find()
            .where(search)
            .skip(((page) - 1) * limit)
            .limit(limit)
            .sort((order == 'desc') ? '-' + sort : sort)
            .then((async (result) => {
                for (let index = 0; index < result.length; index++) {
                    const element = result[index]._doc;
                    if (element.created_by) {
                        var created_by = await User.findOne().where({ _id: element.created_by })
                        if (created_by)
                            element.created_by = created_by._doc.username
                    }
                    if (element.updated_by) {
                        var updated_by = await User.findOne().where({ _id: element.updated_by })
                        if (updated_by)
                            element.updated_by = updated_by._doc.username
                    }


                }
                return result
            }))


        var len_data = await WorkpermitStatus.count().where(search)


        var data = {
            currentPage: page,
            pages: Math.ceil(len_data / limit),
            currentCount: data.length,
            totalCount: len_data,
            data: data

        }

        // if (res)
        //     return res.send(utilSetResponseJson('success', data))
        // return utilSetResponseJson('success', data)
    } catch (error) {
        // if (res)
        //     return res.send(utilSetResponseJson('failed', error.toString()))
        // return utilSetResponseJson('failed', error.toString())
    }
}
const byid = async (req, res) => {
    try {
        var data = await WorkpermitStatus.find()
            .where({ _id: req.params._id })
            .then((async (result) => {
                for (let index = 0; index < result.length; index++) {
                    const element = result[index]._doc;
                    if (element.created_by) {
                        var created_by = await User.findOne().where({ _id: element.created_by })
                        if (created_by)
                            element.created_by = created_by._doc.username
                    }
                    if (element.updated_by) {
                        var updated_by = await User.findOne().where({ _id: element.updated_by })
                        if (updated_by)
                            element.updated_by = updated_by._doc.username
                    }
                }
                return result[0]
            }))
        if (!data) {
            // return res.send(utilSetResponseJson("failed", 'data not found'))
        }
        // if (res)
        //     return res.send(utilSetResponseJson('success', data))
        // return utilSetResponseJson('success', data)
    } catch (error) {
        // if (res)
        //     return res.send(utilSetResponseJson('failed', error.toString()))
        // return utilSetResponseJson('failed', error.toString())
    }
}
const add = async (req, res) => {
    try {

        // if (!req.body.Seq) {
        //     var Seq = await WorkpermitStatus.findOne().sort({ Seq: -1 }).select('Seq')
        //     if (Seq) {
        //         req.body.Seq = Seq.Seq + 1
        //     } else {
        //         req.body.Seq = 1
        //     }
        // }
        // var IsMain = (req.body.IsMain != undefined) ? req.body.IsMain : 1
        var data = await WorkpermitStatus.create(
            {
                ...req.body,
                created_by: req._id,
                created_date: new Date()
            })
        // if (res)
        //     return res.send(utilSetResponseJson('success', data))
        // return utilSetResponseJson('success', data)
    } catch (error) {
        // if (res)
        //     return res.send(utilSetResponseJson('failed', error.toString()))
        // return utilSetResponseJson('failed', error.toString())
    }
}

const edit = async (req, res) => {

    try {

        await WorkpermitStatus.updateOne(
            { _id: req.params._id },
            {
                ...req.body,
                updated_by: req._id,
                updated_date: new Date()
            })

        var data = await WorkpermitStatus.findOne()
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
        var data = await WorkpermitStatus.findOne()
            .where({ _id: req.params._id })
        if (!data) {
            return res.send(utilSetResponseJson("failed", 'data not found'))
        }
        await WorkpermitStatus.deleteOne(
            { _id: req.params._id })

        return res.send(utilSetResponseJson('success', 'success'))

    } catch (error) {
        return res.send(utilSetResponseJson('failed', error.toString()))
    }
}

export { all, byid, add, edit, destroy };
