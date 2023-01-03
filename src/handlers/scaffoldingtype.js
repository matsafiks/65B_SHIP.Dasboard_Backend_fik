
import utilSetResponseJson from '../utils/util.SetResponseJson.js';
import ScaffoldingType from "../models/Master/ScaffoldingType/ScaffoldingType.js";
import _ from 'lodash'
import moment from 'moment-timezone';
import User from '../models/User/User.js';

const all = async (req, res) => {

    try {

        var search = (req) ? req.query.search : undefined
        search = (search) ? {
            $or: [
                { ScaffoldingTypeTypeID: { $regex: '.*' + search + '.*' } },
                { URL_Image: { $regex: '.*' + search + '.*' } }
            ]
        } : {}

        var limit = req.query.limit || 10
        var page = req.query.page || 1
        var sort = req.query.sort || 'nOrder'
        var order = req.query.order || 'asc'

        var data = await ScaffoldingType.find()
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


        var len_data = await ScaffoldingType.count().where(search)


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
        var data = await ScaffoldingType.find()
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

        if (!req.body.nObjectID) {
            var nObjectID = await ScaffoldingType.findOne().sort({ nObjectID: -1 }).select('nObjectID')
            if (nObjectID) {
                req.body.nObjectID = nObjectID.nObjectID + 1
            } else {
                req.body.nObjectID = 1
            }
        }
        if (!req.body.nOrder) {
            var nOrder = await ScaffoldingType.findOne().sort({ nOrder: -1 }).select('nOrder')
            if (nOrder) {
                req.body.nOrder = nOrder.nOrder + 1
            } else {
                req.body.nOrder = 1
            }
        }

        var data = await ScaffoldingType.create(
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

        await ScaffoldingType.updateOne(
            { _id: req.params._id },
            {
                ...req.body,
                updated_by: req._id,
                updated_date: new Date()
            })

        var data = await ScaffoldingType.findOne()
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
        var data = await ScaffoldingType.findOne()
            .where({ _id: req.params._id })
        if (!data) {
            return res.send(utilSetResponseJson("failed", 'data not found'))
        }
        await ScaffoldingType.deleteOne(
            { _id: req.params._id })

        return res.send(utilSetResponseJson('success', 'success'))

    } catch (error) {
        return res.send(utilSetResponseJson('failed', error.toString()))
    }
}

export { all, byid, add, edit, destroy };
