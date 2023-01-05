
import utilSetResponseJson from '../utils/util.SetResponseJson.js';
import Location from "../models/Master/Location/Location.js";
import _ from 'lodash'
import moment from 'moment-timezone';
import User from '../models/User/User.js';

const all = async (req, res) => {

    try {

        let search = (req) ? req.query.search : undefined
        search = (search) ? {
            $or: [
                { Location_Name: { $regex: '.*' + search + '.*' } }
            ]
        } : {}

        let limit = req.query.limit || 10
        let page = req.query.page || 1
        let sort = req.query.sort || 'Location_ID'
        let order = req.query.order || 'asc'

        let data = await Location.find()
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


        let len_data = await Location.count().where(search)


        data = {
            currentPage: page,
            pages: Math.ceil(len_data / limit),
            currentCount: data.length,
            totalCount: len_data,
            data: data

        }

        if (res)
            return res.send(utilSetResponseJson(escape('success'), data))
        return utilSetResponseJson(escape('success'), data)
    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson(escape('failed'), escape(error.toString())))
        return utilSetResponseJson(escape('failed'), escape(error.toString()))
    }
}
const byid = async (req, res) => {
    try {
        let data = await Location.find()
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
            return res.send(utilSetResponseJson(escape('failed'), escape('data not found')))
        }
        if (res)
            return res.send(utilSetResponseJson(escape('success'), data))
        return utilSetResponseJson(escape('success'), data)
    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson(escape('failed'), error.toString()))
        return utilSetResponseJson(escape('failed'), error.toString())
    }
}
const add = async (req, res) => {
    try {


        if (!req.body.Location_ID) {
            let Location_ID = await Location.findOne().sort({ Location_ID: -1 }).select('Location_ID')
            if (Location_ID) {
                req.body.Location_ID = Location_ID.Location_ID + 1
            } else {
                req.body.Location_ID = 1
            }
        }
        let Status = (req.body.Status != undefined) ? req.body.Status : 1

        let data = await Location.create(
            {
                ...req.body,
                Status: Status,
                created_by: req._id,
                created_date: new Date()
            })
        if (res)
            return res.send(utilSetResponseJson(escape('success'), data))
        return utilSetResponseJson(escape('success'), data)
    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson(escape('failed'), error.toString()))
        return utilSetResponseJson(escape('failed'), error.toString())
    }
}

const edit = async (req, res) => {

    try {

        await Location.updateOne(
            { _id: req.params._id },
            {
                ...req.body,
                updated_by: req._id,
                updated_date: new Date()
            })

        let data = await Location.findOne()
            .where({ _id: req.params._id })
        if (!data) {
            return res.send(utilSetResponseJson(escape('failed'), 'data not found'))
        }
        return res.send(utilSetResponseJson(escape('success'), data))

    } catch (error) {
        return res.send(utilSetResponseJson(escape('failed'), error.toString()))
    }

}

const destroy = async (req, res) => {
    try {
        let data = await Location.findOne()
            .where({ _id: req.params._id })
        if (!data) {
            return res.send(utilSetResponseJson(escape('failed'), 'data not found'))
        }
        await Location.deleteOne(
            { _id: req.params._id })

        return res.send(utilSetResponseJson(escape('success'), escape('success')))

    } catch (error) {
        return res.send(utilSetResponseJson(escape('failed'), error.toString()))
    }
}

export { all, byid, add, edit, destroy };
