
import utilSetResponseJson from '../utils/util.SetResponseJson.js';
import Application from "../models/Application/Application.js";
import _ from 'lodash'
import moment from 'moment-timezone';
import User from '../models/User/User.js';
import Group from '../models/Group/Group.js';
import Role from '../models/Role/Role.js';
import { permission } from '../preHandlers/permission.js';

// const all = async (req, res) => {

//     try {

//         let search = (req) ? req.query.search : undefined
//         search = (search) ? {
//             $or: [
//                 { application_name: { $regex: '.*' + search + '.*' } },
//                 { url: { $regex: '.*' + search + '.*' } },
//             ]
//         } : {}

//         let limit = req.query.limit || 10
//         let page = req.query.page || 1
//         let sort = req.query.sort || 'order'
//         let order = req.query.order || 'asc'

//         let child = await Application.find()
//             .where({ ...search, parent_id: { $ne: '' } })
//             .then((async (result) => {
//                 for (let index = 0; index < result.length; index++) {
//                     const element = result[index]._doc;
//                     if (element.created_by) {
//                         let created_by = await User.findOne().where({ _id: element.created_by })
//                         if (created_by)
//                             element.created_by = created_by._doc.username
//                     }
//                     let role = await Role.find().where({ application_id: element._id })
//                     element.role = role
//                 }
//                 return result
//             }))

//         let data = await Application.find()
//             .where({ ...search, parent_id: '' })
//             .skip(((page) - 1) * limit)
//             .limit(limit)
//             .sort((order == 'desc') ? '-' + sort : sort)
//             .then((async (result) => {
//                 for (let index = 0; index < result.length; index++) {
//                     const element = result[index]._doc;
//                     if (element.created_by) {
//                         let created_by = await User.findOne().where({ _id: element.created_by })
//                         if (created_by)
//                             element.created_by = created_by._doc.username
//                     }
//                     let role = await Role.find().where({ application_id: element._id })
//                     element.role = role

//                     element.child = await child.filter(function (el) {
//                         return el.parent_id == element._id
//                     });
//                 }
//                 return result
//             }))


//         let len_data = await Application.count().where({ ...search, parent_id: '' })


//         let data = {
//             currentPage: page,
//             pages: Math.ceil(len_data / limit),
//             currentCount: data.length,
//             totalCount: len_data,
//             data: data

//         }

//         if (res)
//             return res.send(utilSetResponseJson('success', data))
//         return utilSetResponseJson('success', data)
//     } catch (error) {
//         if (res)
//             return res.send(utilSetResponseJson('failed',error)
//         return utilSetResponseJson('failed',error
//     }
// }

const all = async (req, res) => {

    try {

        await permission('62a5f0a4f06755a7772347e1', req)


        let search = (req) ? req.query.search : undefined
        search = (search) ? {
            $or: [
                { application_name: { $regex: '.*' + search + '.*' } },
                { url: { $regex: '.*' + search + '.*' } },
            ]
        } : {}

        let limit = req.query.limit || 10
        let page = req.query.page || 1
        let sort = req.query.sort || 'order'
        let order = req.query.order || 'asc'

        let application_all = await Application.find().sort((order == 'desc') ? '-' + sort : sort)
        let group_all = await Group.find()
        let role_all = await Role.find().where({ application_id: { $in: application_all.map(el => { return el._id }) }, group_id: { $in: group_all.map(el => { return el._id }) } })

        let data = await Application.find()
            .where({ ...search, parent_id: '' })
            .skip(((page) - 1) * limit)
            .limit(limit)
            .sort((order == 'desc') ? '-' + sort : sort)
            .then((async (result) => {
                for (let index = 0; index < result.length; index++) {
                    const element = result[index]._doc;
                    // if (element.created_by) {
                    //     let created_by = await User.findOne().where({ _id: element.created_by })
                    //     if (created_by)
                    //         element.created_by = created_by._doc.username
                    // }
                    element.role = []
                    element.child = []
                    element.role = role_all.filter((el) => {
                        if (el.application_id == element._id) {
                            el._doc.group_name = group_all.filter((el1) => {
                                if (el1._id == el.group_id) {
                                    return el1
                                }
                            })
                            el._doc.group_name = el._doc.group_name[0].group_name
                            return el
                        }
                    })

                    element.child = application_all.filter((el) => {
                        if (el.parent_id == element._id) {
                            el._doc.role = []
                            el._doc.child = []
                            el._doc.role = role_all.filter((el1) => {
                                if (el1.application_id == el._id) {
                                    el1._doc.group_name = group_all.filter((el2) => {
                                        if (el2._id == el1.group_id) {
                                            return el2
                                        }
                                    })
                                    el1._doc.group_name = el1._doc.group_name[0].group_name
                                    return el1
                                }
                            })
                            el._doc.child = application_all.filter((el1) => {
                                if (el1.parent_id == el._id) {
                                    el1._doc.role = []
                                    el1._doc.child = []
                                    el1._doc.role = role_all.filter((el2) => {
                                        if (el2.application_id == el1._id) {
                                            el2._doc.group_name = group_all.filter((el3) => {
                                                if (el3._id == el2.group_id) {
                                                    return el3
                                                }
                                            })
                                            el2._doc.group_name = el2._doc.group_name[0].group_name
                                            return el2
                                        }
                                    })
                                    return el1
                                }
                            })
                            return el
                        }
                    })

                }
                return result
            }))


        let len_data = await Application.count().where({ ...search, parent_id: '' })


        data = {
            currentPage: page,
            pages: Math.ceil(len_data / limit),
            currentCount: data.length,
            totalCount: len_data,
            data: data

        }

        data = escape(data)
        if (res)
            return res.send(utilSetResponseJson('success', data))
        return utilSetResponseJson('success', data)
    } catch (error) {
        error = escape(error.toString())
        if (res)
            return res.send(utilSetResponseJson('failed', error))
        return utilSetResponseJson('failed', error)
    }
}
const byid = async (req, res) => {
    try {

        await permission('62a5f0a4f06755a7772347e1', req)


        let application_all = await Application.find().sort('order')
        let group_all = await Group.find()
        let role_all = await Role.find().where({ application_id: { $in: application_all.map(el => { return el._id }) }, group_id: { $in: group_all.map(el => { return el._id }) } })

        let data = await Application.find()
            .where({ _id: req.params._id })
            .then((async (result) => {
                for (let index = 0; index < result.length; index++) {
                    const element = result[index]._doc;
                    // if (element.created_by) {
                    //     let created_by = await User.findOne().where({ _id: element.created_by })
                    //     if (created_by)
                    //         element.created_by = created_by._doc.username
                    // }
                    element.role = []
                    element.child = []
                    element.role = role_all.filter((el, index) => {
                        if (el.application_id == element._id) {
                            el._doc.group_name = group_all.filter((el1) => {
                                if (el1._id == el.group_id) {
                                    return el1
                                }
                            })
                            el._doc.group_name = el._doc.group_name[0].group_name
                            return el
                        }
                    })
                    element.child = application_all.filter((el) => {
                        if (el.parent_id == element._id) {
                            el._doc.role = []
                            el._doc.child = []
                            el._doc.role = role_all.filter((el1) => {
                                if (el1.application_id == el._id) {
                                    el1._doc.group_name = group_all.filter((el2) => {
                                        if (el2._id == el1.group_id) {
                                            return el2
                                        }
                                    })
                                    el1._doc.group_name = el1._doc.group_name[0].group_name
                                    return el1
                                }
                            })
                            el._doc.child = application_all.filter((el1) => {
                                if (el1.parent_id == el._id) {
                                    el1._doc.role = []
                                    el1._doc.child = []
                                    el1._doc.role = role_all.filter((el2) => {
                                        if (el2.application_id == el1._id) {
                                            el2._doc.group_name = group_all.filter((el3) => {
                                                if (el3._id == el2.group_id) {
                                                    return el3
                                                }
                                            })
                                            el2._doc.group_name = el2._doc.group_name[0].group_name
                                            return el2
                                        }
                                    })
                                    return el1
                                }
                            })
                            return el
                        }
                    })
                }
                return result
            }))
        if (!data) {
            let msg = escape("data not found")
            return res.send(utilSetResponseJson("failed", msg))
        }
        data = escape(data)
        if (res)
            return res.send(utilSetResponseJson('success', data))
        return utilSetResponseJson('success', data)
    } catch (error) {
        error = escape(error.toString())
        if (res)
            return res.send(utilSetResponseJson('failed', error))
        return utilSetResponseJson('failed', error)
    }
}
// const byid = async (req, res) => {
//     try {
//         let child = await Application.find()
//             .where({ parent_id: req.params._id })
//             .then((async (result) => {
//                 for (let index = 0; index < result.length; index++) {
//                     const element = result[index]._doc;
//                     if (element.created_by) {
//                         let created_by = await User.findOne().where({ _id: element.created_by })
//                         if (created_by)
//                             element.created_by = created_by._doc.username
//                     }
//                     let role = await Role.find().where({ application_id: element._id })
//                         .then(async (result1) => {
//                             for (let index1 = 0; index1 < result1.length; index1++) {
//                                 const element1 = result1[index1]._doc;
//                                 let group = await Group.findOne().where({ _id: element1.group_id })
//                                 console.log(group.group_name)
//                                 element1.group_name = group.group_name
//                             }
//                             return result1
//                         })
//                     element.role = role
//                 }
//                 return result
//             }))

//         let data = await Application.find()
//             .where({ _id: req.params._id })
//             .then((async (result) => {
//                 for (let index = 0; index < result.length; index++) {
//                     const element = result[index]._doc;
//                     if (element.created_by) {
//                         let created_by = await User.findOne().where({ _id: element.created_by })
//                         if (created_by)
//                             element.created_by = created_by._doc.username
//                     }
//                     let role = await Role.find().where({ application_id: element._id })
//                         .then(async (result1) => {
//                             for (let index1 = 0; index1 < result1.length; index1++) {
//                                 const element1 = result1[index1]._doc;
//                                 let group = await Group.findOne().where({ _id: element1.group_id })
//                                 console.log(group.group_name)
//                                 element1.group_name = group.group_name
//                             }
//                             return result1
//                         })
//                     element.role = role

//                     element.child = await child.filter(function (el) {
//                         return el.parent_id == element._id
//                     });

//                 }
//                 return result[0]
//             }))
//         if (!data) {
//             return res.send(utilSetResponseJson("failed", 'data not found'))
//         }
//         if (res)
//             return res.send(utilSetResponseJson('success', data))
//         return utilSetResponseJson('success', data)
//     } catch (error) {
//         if (res)
//             return res.send(utilSetResponseJson('failed',error)
//         return utilSetResponseJson('failed',error
//     }
// }
const add = async (req, res) => {
    try {

        await permission('62a5f0a4f06755a7772347e1', req)


        if (req.body.role && req.body.role.length > 0) {
            for (let index = 0; index < req.body.role.length; index++) {
                const element = req.body.role[index];
                let check = await Group.findOne().where({ _id: element.group_id })
                if (!check) {
                    throw 'group not found'
                }
            }
        }
        if (!req.body.url) {
            req.body.url = req.body.application_name
        }
        if (!req.body.order) {
            let order = await Application.findOne().sort({ order: -1 }).select('order')
            if (order) {
                req.body.order = order.order + 1
            } else {
                req.body.order = 1
            }
        }
        let status = (req.body.status != undefined) ? req.body.status : 1

        let data = await Application.create(
            {
                ...req.body,
                status: status,
                created_by: req._id,
                created_date: new Date()
            })
        if (req.body.role && req.body.role.length > 0) {

            await Role.deleteMany({ application_id: req.params._id })

            for (let index = 0; index < req.body.role.length; index++) {
                const element = req.body.role[index];

                await Role.create({
                    // ...element,
                    application_id: data._id,
                    group_id: element.group_id,
                    get: element.get,
                    put: element.put,
                    post: element.post,
                    delete: element.delete

                })
            }
        }
        data = escape(data)
        if (res)
            return res.send(utilSetResponseJson('success', data))
        return utilSetResponseJson('success', data)
    } catch (error) {
        error = escape(error.toString())
        if (res)
            return res.send(utilSetResponseJson('failed', error))
        return utilSetResponseJson('failed', error)
    }
}

const edit = async (req, res) => {

    try {

        await permission('62a5f0a4f06755a7772347e1', req)


        if (req.body.parent_id) {
            let check = await Application.findOne().where({ _id: req.body.parent_id })
            if (!check) {
                throw 'parent_id not found'
            }

        }

        if (req.body.role && req.body.role.length > 0) {
            for (let index = 0; index < req.body.role.length; index++) {
                const element = req.body.role[index];
                let check = await Group.findOne().where({ _id: element.group_id })
                if (!check) {
                    throw 'group not found'
                }
            }
        }

        await Application.updateOne(
            { _id: req.params._id },
            {
                ...req.body,
                updated_by: req._id,
                updated_date: new Date()
            })
        if (req.body.role && req.body.role.length > 0) {

            await Role.deleteMany({ application_id: req.params._id })

            for (let index = 0; index < req.body.role.length; index++) {
                const element = req.body.role[index];

                await Role.create({
                    // ...element,
                    application_id: req.params._id,
                    group_id: element.group_id,
                    get: element.get,
                    put: element.put,
                    post: element.post,
                    delete: element.delete

                })
            }
        } else if (req.body.role && req.body.role.length == 0) {
            await Role.deleteMany({ application_id: req.params._id })
        }

        let data = await Application.find()
            .where({ _id: req.params._id })
            .then((async (result) => {
                for (let index = 0; index < result.length; index++) {
                    const element = result[index]._doc;
                    let role = await Role.find().where({ application_id: element._id })
                    element.role = role

                }
                return result[0]
            }))
        if (!data) {
            let msg = escape("data not found")
            return res.send(utilSetResponseJson("failed", msg))
        }
        return res.send(utilSetResponseJson('success', data))

    } catch (error) {
        error = escape(error.toString())
        return res.send(utilSetResponseJson('failed', error))
    }

}

const destroy = async (req, res) => {
    try {

        await permission('62a5f0a4f06755a7772347e1', req)


        let data = await Application.findOne()
            .where({ _id: req.params._id })
        if (!data) {
            return res.send(utilSetResponseJson("failed", 'data not found'))
        }
        await Application.deleteOne(
            { _id: req.params._id })

        await Role.deleteMany({ application_id: req.params._id })

        let msg = escape("success")
        return res.send(utilSetResponseJson('success', msg))

    } catch (error) {
        error = escape(error.toString())
        return res.send(utilSetResponseJson('failed', error))
    }
}

export { all, byid, add, edit, destroy };
