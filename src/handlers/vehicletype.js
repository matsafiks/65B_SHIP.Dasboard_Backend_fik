
import utilSetResponseJson from '../utils/util.SetResponseJson.js';
import VehicleType from "../models/Master/VehicleType/VehicleType.js";
import _ from 'lodash'
import User from '../models/User/User.js';
import sanitizeHtml from "sanitize-html";

const all = async (req, res) => {

    try {

        let search = (req) ? req.query.search : undefined
        search = (search) ? {
            $or: [
                { VehicleTypeTypeID: { $regex: '.*' + search + '.*' } },
                { URL_Image: { $regex: '.*' + search + '.*' } }
            ]
        } : {}

        let limit = req.query.limit || 10
        let page = req.query.page || 1
        let sort = req.query.sort || 'VehicleID'
        let order = req.query.order || 'asc'

        let data = await VehicleType.find()
            .where(search)
            .skip(((page) - 1) * limit)
            .limit(limit)
            .sort((order == 'desc') ? '-' + sort : sort)
            .then((async (result) => {
                for (let index = 0; index < result.length; index++) {
                    const element = result[index]._doc;
                    if (element.created_by) {
                        let created_by = await User.findOne().where({ _id: element.created_by })
                        if (created_by)
                            element.created_by = created_by._doc.username
                    }
                    if (element.updated_by) {
                        let updated_by = await User.findOne().where({ _id: element.updated_by })
                        if (updated_by)
                            element.updated_by = updated_by._doc.username
                    }
                }
                return result
            }))


        let len_data = await VehicleType.count().where(search)


        data = {
            currentPage: page,
            pages: Math.ceil(len_data / limit),
            currentCount: data.length,
            totalCount: len_data,
            data: data

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
const byid = async (req, res) => {
    try {
        let data = await VehicleType.find()
            .where({ _id: req.params._id })
            .then((async (result) => {
                for (let index = 0; index < result.length; index++) {
                    const element = result[index]._doc;
                    if (element.created_by) {
                        let created_by = await User.findOne().where({ _id: element.created_by })
                        if (created_by)
                            element.created_by = created_by._doc.username
                    }
                    if (element.updated_by) {
                        let updated_by = await User.findOne().where({ _id: element.updated_by })
                        if (updated_by)
                            element.updated_by = updated_by._doc.username
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

        if (!req.body.VehicleID) {
            let VehicleID = await VehicleType.findOne().sort({ VehicleID: -1 }).select('VehicleID')
            if (VehicleID) {
                req.body.VehicleID = VehicleID.VehicleID + 1
            } else {
                req.body.VehicleID = 1
            }
        }
        let data = await VehicleType.create(
            {
                ...req.body,
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

        await VehicleType.updateOne(
            { _id: req.params._id },
            {
                ...req.body,
                updated_by: req._id,
                updated_date: new Date()
            })

        let data = await VehicleType.findOne()
            .where({ _id: req.params._id })
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
        let data = await VehicleType.findOne()
            .where({ _id: req.params._id })
        if (!data) {
            return res.send(utilSetResponseJson("failed", 'data not found'))
        }
        await VehicleType.deleteOne(
            { _id: req.params._id })

        return res.send(utilSetResponseJson('success', 'success'))

    } catch (error) {
        return res.send(utilSetResponseJson('failed', error.toString()))
    }
}

export { all, byid, add, edit, destroy };
