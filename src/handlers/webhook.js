

import WorkPermit from "../models/WorkPermit/WorkPermit.js";
import utilSetResponseJson from '../utils/util.SetResponseJson.js';
import socket_io from "../utils/socket_io.js";
import moment from 'moment-timezone';
import User from "../models/User/User.js";
import { generateHashPassword, dateStrToDdmmyyy } from "../utils/function.js";
import Scaffolding from "../models/Scaffolding/Scaffolding.js";
import { all } from "./scaffolding.js";
import _ from 'lodash'
import AccessControl from "../models/AccessControl/AccessControl.js";
import AccessControlDevice from "../models/AccessControlDevice/AccessControlDevice.js";
import Equipment from "../models/Equipment/Equipment.js";
import EquipmentVehicle from "../models/EquipmentVehicle/EquipmentVehicle.js";
import { permission } from "../preHandlers/permission.js";
import Vehicle from "../models/Vehicle/Vehicle.js";
import People from "../models/People/People.js";
import PeopleRestrict from "../models/PeopleRestrict/PeopleRestrict.js";
import Vehicle2 from "../models/Vehicle2/Vehicle2.js";
import Vehicle5 from "../models/Vehicle5/Vehicle5.js";
import Vehicle6 from "../models/Vehicle6/Vehicle6.js";
import insert_log from "../utils/insert_log.js";
import AccessControlExchangeCard from "../models/AccessControlExchangeCard/AccessControlExchangeCard.js";

const dateThailand = moment.tz(Date.now(), "Asia/Bangkok");

const addBasicAuth = async (req, res) => {

    try {

        var data = {
            username: req.body.username,
            password: await generateHashPassword(req.body.password),
            user_group: req.body.user_group,
            status: 1,
            created_date: dateThailand
        }
        var create = await User.create(data)
        res.send(utilSetResponseJson('success', create))
    } catch (error) {
        res.send(utilSetResponseJson('failed', error.toString()))
    }
}

const getBasicAuth = async (req, res) => {

    try {
        var data = await User.find()
        res.send(utilSetResponseJson('success', data))
    } catch (error) {
        res.send(utilSetResponseJson('failed', error.toString()))
    }
}

const scaffolding = async (req, res) => {

    try {

        var application_id = '62a5c8003ec7e79898750deb'
        await permission(application_id, req)

        var io = await socket_io.getIo()

        // var check_run_no = await Scaffolding.findOne().sort({ 'others.run_no': -1 }).select('others.run_no')
        // check_run_no = _.isObject(check_run_no) ? check_run_no.others.run_no + 1 : 1

        var data_in_db = await Scaffolding.find()
        var error = []

        var data_create = []
        var data_update = []


        for (let index = 0; index < req.body.length; index++) {
            const el = req.body[index];

            if (el.WorkingStartDate) {
                var new_date = new Date(el.WorkingStartDate)
                if (new_date != 'Invalid Date') {
                    // WorkingEnd = new_date
                } else {
                    error.push({ index: index, cases: 'WorkingStartDate invalid date' })
                }
            }

            if (el.WorkingEndDate) {
                var new_date = new Date(el.WorkingEndDate)
                if (new_date != 'Invalid Date') {
                    // WorkingEnd = new_date
                } else {
                    error.push({ index: index, cases: 'WorkingEndDate invalid date' })
                }
            }
            if (el.RemoveDate) {
                var new_date = new Date(el.RemoveDate)
                if (new_date != 'Invalid Date') {
                    // WorkingEnd = new_date
                } else {
                    error.push({ index: index, cases: 'RemoveDate invalid date' })
                }
            }

            if (el.Features) {
                try {
                    el.FeaturesPropertiesCentroid_X = el.Features.properties.CENTROID_X
                    el.FeaturesPropertiesCentroid_Y = el.Features.properties.CENTROID_Y

                } catch (err) {
                    error.push({ index: index, cases: 'Features invalid format' })
                }

            }
            else {
                // error.push({ index: index, cases: 'Features is required' })
            }

            var check = data_in_db.filter((el1) => {
                return el1.ScaffoldingCode == el.ScaffoldingCode
            })

            if (check.length > 0) {
                data_update.push([
                    check[0]._id, {
                        ...el,
                        others: {
                            updated_date: new Date(),
                            created_date: check[0].others.created_date
                            // run_no: check_run_no
                        }
                    }])

            } else {
                data_create.push({
                    ...el,
                    others: {
                        created_date: new Date(),
                        // run_no: check_run_no
                    }
                })
            }

        }


        if (error.length > 0) {

            const groupByCases = error.reduce((group, error) => {
                const { cases } = error;
                group[cases] = group[cases] ?? [];
                group[cases].push(error.index);
                return group;
            }, {});

            var error_str = JSON.stringify(groupByCases)
            insert_log(req, 'webhook scaffolding', error_str.toString())

            return res.send(utilSetResponseJson('failed', error_str))
        }

        if (data_create.length > 0) {
            await Scaffolding.insertMany(data_create).then(res => {
                insert_log(req, 'webhook scaffolding', '')

            }).catch(error_str => {
                insert_log(req, 'webhook scaffolding', error_str.toString())
                throw error_str

            })
        }
        if (data_update.length > 0) {
            for (let index = 0; index < data_update.length; index++) {
                const element = data_update[index];

                await Scaffolding.replaceOne(
                    { _id: element[0] }, element[1]).then(res => {
                        insert_log(req, 'webhook scaffolding', '')

                    }).catch(error_str => {
                        insert_log(req, 'webhook scaffolding', error_str.toString())
                        throw error_str

                    })
            }
        }

        var data = await Scaffolding.find()

        io.sockets.emit('scaffolding', 'new')
        io.sockets.emit('notification', 'new')


        res.send(utilSetResponseJson('success', data))
    } catch (error) {
        res.send(utilSetResponseJson('failed', error.toString()))
    }
}

const workPermit = async (req, res) => {
    try {

        if (res) {
            var application_id = '62a5c8003ec7e79898750deb'
            await permission(application_id, req)
        }

        var io = await socket_io.getIo()
        // var check_run_no = await WorkPermit.findOne().sort({ 'others.run_no': -1 }).select('others.run_no')
        // check_run_no = _.isObject(check_run_no) ? check_run_no.others.run_no + 1 : 1
        var data_in_db = await WorkPermit.find()
        var error = []

        var data_create = []
        var data_update = []
        var data_delete = []

        for (let index = 0; index < req.body.length; index++) {
            const el = req.body[index];

            var workingStart = null
            var workingEnd = null

            if (el.gasMeasurement) {
                if (el.gasMeasurement.split(' ').length > 1) {
                    var new_date = new Date(el.gasMeasurement)
                } else {
                    var new_date = new Date(new Date().toISOString().split('T')[0] + ' ' + el.GasMeasurement)
                }
                if (new_date != 'Invalid Date') {
                    // gas_timeout = setTimeout(() => {
                    //     console.log(index)
                    // }, index * 500)

                } else {
                    error.push({ index: index, cases: 'gasMeasurement invalid time' })
                }
            }

            if (el.workStartDate) {
                var new_date = new Date(el.workStartDate.replace(/\s/g, '') + ' ' + el.workStartTime.replace(/\s/g, ''))
                if (new_date != 'Invalid Date') {
                    workingStart = new_date
                } else {
                    error.push({ index: index, cases: 'workStartDate or workStartTime  invalid date' })
                }
            }

            if (el.workEndDate) {
                var new_date = new Date(el.workEndDate.replace(/\s/g, '') + ' ' + el.workEndTime.replace(/\s/g, ''))
                if (new_date != 'Invalid Date') {
                    workingEnd = new_date
                } else {
                    error.push({ index: index, cases: 'workEndDate or workEndTime  invalid date' })
                }
            }

            var check = data_in_db.filter((el1) => {
                return (el1.workPermitID == el.workPermitID && el1.idCard == el.idCard)
            })

            if (check.length > 0) {
                data_update.push([
                    check[0]._id, {
                        ...el,
                        others: {
                            workingStart,
                            workingEnd,
                            updated_date: new Date(),
                            created_date: check[0].others.created_date
                            // run_no: check_run_no
                        }
                    }])

            } else {
                data_create.push({
                    ...el,
                    others: {
                        workingStart,
                        workingEnd,
                        created_date: new Date(),
                        // run_no: check_run_no
                    }
                })
            }
        }

        if (error.length > 0) {

            // clearTimeout(gas_timeout)

            const groupByCases = error.reduce((group, error) => {
                const { cases } = error;
                group[cases] = group[cases] ?? [];
                group[cases].push(error.index);
                return group;
            }, {});

            var error_str = JSON.stringify(groupByCases)

            insert_log(req, 'webhook workpermit', error_str.toString())

            if (res)
                return res.send(utilSetResponseJson('failed', error_str))
            return utilSetResponseJson('failed', error_str)
        }


        if (data_create.length > 0) {
            await WorkPermit.insertMany(data_create).then(res => {
                insert_log(req, 'webhook workpermit', '')

            }).catch(error_str => {
                insert_log(req, 'webhook workpermit', error_str.toString())
                throw error_str
            })
        }
        if (data_update.length > 0) {
            for (let index = 0; index < data_update.length; index++) {
                const element = data_update[index];

                await WorkPermit.replaceOne(
                    { _id: element[0] }, element[1]).then(res => {
                        insert_log(req, 'webhook workpermit', '')

                    }).catch(error_str => {
                        insert_log(req, 'webhook workpermit', error_str.toString())
                        throw error_str
                    })

            }
        }

        if (data_delete.length > 0) {
            await WorkPermit.deleteMany({
                workPermitNo: { $in: data_delete }
            })
        }
        var data = await WorkPermit.find()

        //countdown for recheck notification
        // for (let index = 0; index < data.length; index++) {
        //     const element = data[index];
        //     if (element.GasMeasurement) {
        //         console.log({ [index]: new Date(new Date().toISOString().split('T')[0] + ' ' + element.GasMeasurement).toLocaleTimeString() })
        //     }
        //     // setTimeout
        // }

        // return res.send(utilSetResponseJson('success', data))

        io.sockets.emit('workpermit', 'new')
        io.sockets.emit('notification', 'new')
        if (res)
            return res.send(utilSetResponseJson('success', data))
        return utilSetResponseJson('success', data)
    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson('failed', error.toString()))
        return utilSetResponseJson('failed', error.toString())
    }
}

const accessControl = async (req, res) => {

    try {

        if (res) {
            var application_id = '62a5c8003ec7e79898750deb'
            await permission(application_id, req)
        }


        var io = await socket_io.getIo()

        // var check_run_no = await AccessControl.findOne().sort({ 'others.run_no': -1 }).select('others.run_no')
        // check_run_no = _.isObject(check_run_no) ? check_run_no.others.run_no + 1 : 1
        var data_in_db = await AccessControl.find()
        var error = []

        var data_create = []
        var data_update = []

        for (let index = 0; index < req.body.length; index++) {
            const el = req.body[index];

            if (el.ScanDate) {
                var new_date = new Date(el.ScanDate)
                if (new_date != 'Invalid Date') {
                    // el.ScanDate = new_date
                } else {
                    error.push({ index: index, cases: 'ScanDate invalid date' })
                }
            }

            if (el.ExchangeCardDate) {
                var new_date = new Date(el.ExchangeCardDate)
                if (new_date != 'Invalid Date') {
                    // el.ExchangeCardDate = new_date
                } else {
                    error.push({ index: index, cases: 'ExchangeCardDate invalid date' })
                }
            }

            if (el.ScanTime) {
                var new_date = new Date(new Date().toISOString().split('T')[0] + ' ' + el.ScanTime)
                if (new_date != 'Invalid Date') {
                    // el.ScanTime = new_date
                } else {
                    error.push({ index: index, cases: 'ScanTime invalid time' })
                }
            }

            if (el.ExchangeCardTime) {
                var new_date = new Date(new Date().toISOString().split('T')[0] + ' ' + el.ExchangeCardTime)
                if (new_date != 'Invalid Date') {
                    // el.ExchangeCardTime = new_date
                } else {
                    error.push({ index: index, cases: 'ExchangeCardTime invalid time' })
                }
            }

            var scan_date_time = null
            if (el.ScanDate && el.ScanTime) {
                var scan_date_time = new Date(el.ScanDate + ' ' + el.ScanTime)

                var ScanDateTimeAnyStatus = {}
                if (el.ScanStatus == 1) {
                    ScanDateTimeAnyStatus.ScanDateTime1 = scan_date_time
                } else if (el.ScanStatus == 2) {
                    ScanDateTimeAnyStatus.ScanDateTime2 = scan_date_time
                }
            }

            var exchange_date_time = null
            if (el.ExchangeCardDate && el.ExchangeCardTime) {
                var exchange_date_time = new Date(el.ExchangeCardDate + ' ' + el.ExchangeCardTime)

                var ExchangeCardDateTimeAnyStatus = {}
                if (el.ExchangeCardStatus == 1) {
                    ExchangeCardDateTimeAnyStatus.ExchangeCardDateTime1 = exchange_date_time
                } else if (el.ExchangeCardStatus == 2) {
                    ExchangeCardDateTimeAnyStatus.ExchangeCardDateTime2 = exchange_date_time
                }
            }


            var check = data_in_db.filter((el1) => {
                return el1.PersonalID == el.PersonalID
            })

            if (check.length > 0) {
                data_update.push([
                    check[0]._id, {
                        ...el,
                        others: {
                            ...check[0].others,
                            scan_date_time: scan_date_time,
                            ...ScanDateTimeAnyStatus,
                            exchange_date_time: exchange_date_time,
                            ...ExchangeCardDateTimeAnyStatus,
                            updated_date: new Date(),
                        }

                    }])

            } else {
                data_create.push({
                    ...el,
                    others: {
                        scan_date_time: scan_date_time,
                        ...ScanDateTimeAnyStatus,
                        exchange_date_time: exchange_date_time,
                        ...ExchangeCardDateTimeAnyStatus,
                        created_date: new Date(),
                        // run_no: check_run_no
                    }
                })
            }

        }

        if (error.length > 0) {

            // clearTimeout(gas_timeout)

            const groupByCases = error.reduce((group, error) => {
                const { cases } = error;
                group[cases] = group[cases] ?? [];
                group[cases].push(error.index);
                return group;
            }, {});

            var error_str = JSON.stringify(groupByCases)

            insert_log(req, 'webhook accesscontrol', error_str.toString())

            if (res)
                return res.send(utilSetResponseJson('failed', error_str))
            return utilSetResponseJson('failed', error_str)
        }

        if (data_create.length > 0) {
            await AccessControl.insertMany(data_create).then(res => {
                insert_log(req, 'webhook accesscontrol', '')

            }).catch(error_str => {
                insert_log(req, 'webhook accesscontrol', error_str.toString())
                throw error_str
            })
        }
        if (data_update.length > 0) {
            for (let index = 0; index < data_update.length; index++) {
                const element = data_update[index];

                await AccessControl.replaceOne(
                    { _id: element[0] }, element[1]).then(res => {
                        insert_log(req, 'webhook accesscontrol', '')

                    }).catch(error_str => {
                        insert_log(req, 'webhook accesscontrol', error_str.toString())
                        throw error_str
                    })
            }
        }

        var data = await AccessControl.find()

        io.sockets.emit('accesscontrol', 'new')

        if (res)
            return res.send(utilSetResponseJson('success', data))
        return utilSetResponseJson('success', data)
    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson('failed', error.toString()))
        return utilSetResponseJson('failed', error.toString())
    }
}

const accessControlPut = async (req, res) => {

    try {
        var application_id = '62a5c8003ec7e79898750deb'
        await permission(application_id, req)

        var io = await socket_io.getIo()

        var check_run_no = await AccessControl.findOne().sort({ 'others.run_no': -1 }).select('others.run_no')
        check_run_no = _.isObject(check_run_no) ? check_run_no.others.run_no : 0

        var error = []
        var data = []

        for (let index = 0; index < req.body.length; index++) {
            const el = req.body[index];

            var check_data = await AccessControl.find({
                $and: [
                    {
                        'others.run_no': check_run_no
                    },
                    { PersonalID: el.PersonalID }
                ]
            })
            if (check_data.length == 0) {
                error.push({ index: index, cases: 'PersonalID not found' })
            }

            if (el.ScanDate) {
                var new_date = new Date(el.ScanDate)
                if (new_date != 'Invalid Date') {
                    // el.ScanDate = new_date
                } else {
                    error.push({ index: index, cases: 'ScanDate invalid date' })
                }
            }

            if (el.ExchangeCardDate) {
                var new_date = new Date(el.ExchangeCardDate)
                if (new_date != 'Invalid Date') {
                    // el.ExchangeCardDate = new_date
                } else {
                    error.push({ index: index, cases: 'ExchangeCardDate invalid date' })
                }
            }

            if (el.ScanTime) {
                var new_date = new Date(new Date().toISOString().split('T')[0] + ' ' + el.ScanTime)
                if (new_date != 'Invalid Date') {
                    // el.ScanTime = new_date
                } else {
                    error.push({ index: index, cases: 'ScanTime invalid time' })
                }
            }

            if (el.ExchangeCardTime) {
                var new_date = new Date(new Date().toISOString().split('T')[0] + ' ' + el.ExchangeCardTime)
                if (new_date != 'Invalid Date') {
                    // el.ExchangeCardTime = new_date
                } else {
                    error.push({ index: index, cases: 'ExchangeCardTime invalid time' })
                }
            }

            var scan_date_time = null
            if (el.ScanDate && el.ScanTime) {
                var scan_date_time = new Date(el.ScanDate + ' ' + el.ScanTime)
            }

            data.push(
                {
                    ...el,
                    others: {
                        scan_date_time: scan_date_time,
                        created_date: new Date(),
                        run_no: check_run_no
                    }
                }
            )

        }


        if (error.length > 0) {

            // clearTimeout(gas_timeout)
            console.log('check_data')

            const groupByCases = error.reduce((group, error) => {
                const { cases } = error;
                group[cases] = group[cases] ?? [];
                group[cases].push(error.index);
                return group;
            }, {});

            var error_str = JSON.stringify(groupByCases)

            return res.send(utilSetResponseJson('failed', error_str))
        }

        for (let index = 0; index < data.length; index++) {
            const el = data[index];

            await AccessControl.updateOne(
                {
                    $and: [
                        {
                            'others.run_no': check_run_no
                        },
                        { PersonalID: el.PersonalID }
                    ]
                },
                el
            )

        }

        var data = await AccessControl.find()
            .where({
                $and: [
                    {
                        'others.run_no': check_run_no
                    }
                ]
            })

        io.sockets.emit('accesscontrol', 'new')

        res.send(utilSetResponseJson('success', data))
    } catch (error) {
        res.send(utilSetResponseJson('failed', error.toString()))
    }
}


const accessControlDevice = async (req, res) => {

    try {


        if (res) {
            var application_id = '62a5c8003ec7e79898750deb'
            await permission(application_id, req)
        }

        var io = await socket_io.getIo()

        // var check_run_no = await AccessControlDevice.findOne().sort({ 'others.run_no': -1 }).select('others.run_no')
        // check_run_no = _.isObject(check_run_no) ? check_run_no.others.run_no + 1 : 1

        var error = []
        var data = []

        for (let index = 0; index < req.body.length; index++) {
            const el = req.body[index];

            data.push({
                ...el,
                others: {
                    created_date: new Date(),
                    // run_no: check_run_no
                }
            })
        }


        if (error.length > 0) {
            const groupByCases = error.reduce((group, error) => {
                const { cases } = error;
                group[cases] = group[cases] ?? [];
                group[cases].push(error.index);
                return group;
            }, {});

            var error_str = JSON.stringify(groupByCases)
            insert_log(req, 'webhook accesscontroldevice', error_str.toString())

            return res.send(utilSetResponseJson('failed', error_str))
        }

        await AccessControlDevice.deleteMany()

        var create = await AccessControlDevice.insertMany(data).then(res => {
            insert_log(req, 'webhook accesscontroldevice', '')

        }).catch(error_str => {
            insert_log(req, 'webhook accesscontroldevice', error_str.toString())
            throw error_str
        })

        io.sockets.emit('accesscontroldevice', 'new')
        io.sockets.emit('notification', 'new')

        data = await AccessControlDevice.find()

        if (res)
            return res.send(utilSetResponseJson('success', data))
        return utilSetResponseJson('success', create)
    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson('failed', error.toString()))
        return utilSetResponseJson('failed', error.toString())
    }
}

const accessControlExchangeCard = async (req, res) => {

    try {


        if (res) {
            var application_id = '62a5c8003ec7e79898750deb'
            await permission(application_id, req)
        }

        var io = await socket_io.getIo()

        var error = []
        var data = []

        const el = req.body;

        data = {
            ...el,
            others: {
                created_date: new Date(),
            }
        }

        await AccessControlExchangeCard.deleteMany()

        var create = await AccessControlExchangeCard.create(data).then(res => {
            insert_log(req, 'webhook accesscontrolexchangecard', '')

        }).catch(error_str => {
            insert_log(req, 'webhook accesscontrolexchangecard', error_str.toString())
            throw error_str
        })

        io.sockets.emit('accesscontrol', 'new')
        io.sockets.emit('notification', 'new')

        var data = await AccessControlExchangeCard.findOne()


        if (res)
            return res.send(utilSetResponseJson('success', data))
        return utilSetResponseJson('success', create)
    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson('failed', error.toString()))
        return utilSetResponseJson('failed', error.toString())
    }
}

const equipment = async (req, res) => {

    try {

        var application_id = '62a5c8003ec7e79898750deb'
        await permission(application_id, req)

        var io = await socket_io.getIo()

        // var check_run_no = await Equipment.findOne().sort({ 'others.run_no': -1 }).select('others.run_no')
        // check_run_no = _.isObject(check_run_no) ? check_run_no.others.run_no + 1 : 1

        var data_in_db = await Equipment.find()
        var error = []

        var data_create = []
        var data_update = []

        for (let index = 0; index < req.body.length; index++) {
            const el = req.body[index];

            if (el.DateTime_In) {
                var new_date = new Date(el.DateTime_In)
                if (new_date != 'Invalid Date') {
                    // el.DateTime_In = new_date
                } else {
                    error.push({ index: index, cases: 'DateTime_In invalid date' })
                }
            }

            if (el.DateTime_Out) {
                var new_date = new Date(el.DateTime_Out)
                if (new_date != 'Invalid Date') {
                    // el.DateTime_Out = new_date
                } else {
                    error.push({ index: index, cases: 'DateTime_Out invalid date' })
                }
            } else {
                el.DateTime_Out = null
            }

            if (el.ExpiredDate) {
                var new_date = new Date(el.ExpiredDate)
                if (new_date != 'Invalid Date') {
                    // el.ExpiredDate = new_date
                } else {
                    error.push({ index: index, cases: 'ExpiredDate invalid date' })
                }
            }

            var check = data_in_db.filter((el1) => {
                return el1.EquipmentID == el.EquipmentID
            })

            if (check.length > 0) {
                data_update.push([
                    check[0]._id, {
                        ...el,
                        others: {
                            updated_date: new Date(),
                            created_date: check[0].others.created_date
                            // run_no: check_run_no
                        }
                    }])

            } else {
                data_create.push({
                    ...el,
                    others: {
                        created_date: new Date(),
                        // run_no: check_run_no
                    }
                })
            }


        }


        if (error.length > 0) {

            // clearTimeout(gas_timeout)

            const groupByCases = error.reduce((group, error) => {
                const { cases } = error;
                group[cases] = group[cases] ?? [];
                group[cases].push(error.index);
                return group;
            }, {});

            var error_str = JSON.stringify(groupByCases)
            insert_log(req, 'webhook equipment', error_str.toString())

            return res.send(utilSetResponseJson('failed', error_str))
        }

        if (data_create.length > 0) {
            await Equipment.insertMany(data_create).then(res => {
                insert_log(req, 'webhook equipment', '')

            }).catch(error_str => {
                insert_log(req, 'webhook equipment', error_str.toString())
                throw error_str
            })
        }
        if (data_update.length > 0) {
            for (let index = 0; index < data_update.length; index++) {
                const element = data_update[index];

                await Equipment.replaceOne(
                    { _id: element[0] }, element[1]).then(res => {
                        insert_log(req, 'webhook equipment', '')

                    }).catch(error_str => {
                        insert_log(req, 'webhook equipment', error_str.toString())
                        throw error_str
                    })
            }
        }

        var data = await Equipment.find()

        io.sockets.emit('equipment', 'new')
        io.sockets.emit('notification', 'new')


        res.send(utilSetResponseJson('success', data))
    } catch (error) {
        res.send(utilSetResponseJson('failed', error.toString()))
    }
}
const equipmentVehicle = async (req, res) => {

    try {
        var application_id = '62a5c8003ec7e79898750deb'
        await permission(application_id, req)

        var io = await socket_io.getIo()

        // var check_run_no = await EquipmentVehicle.findOne().sort({ 'others.run_no': -1 }).select('others.run_no')
        // check_run_no = _.isObject(check_run_no) ? check_run_no.others.run_no + 1 : 1
        var data_in_db = await EquipmentVehicle.find()
        var error = []

        var data_create = []
        var data_update = []

        for (let index = 0; index < req.body.length; index++) {
            const el = req.body[index];

            if (el.Remove_Obstruction) {
                var new_date = new Date(el.Remove_Obstruction)
                if (new_date != 'Invalid Date') {
                    // el.Remove_Obstruction = new_date
                } else {
                    error.push({ index: index, cases: 'Remove_Obstruction invalid date' })
                }
            }

            var check = data_in_db.filter((el1) => {
                return el1.ObstructionID == el.ObstructionID
            })

            if (check.length > 0) {
                data_update.push([
                    check[0]._id, {
                        ...el,
                        others: {
                            updated_date: new Date(),
                            created_date: check[0].others.created_date
                            // run_no: check_run_no
                        }
                    }])

            } else {
                data_create.push({
                    ...el,
                    others: {
                        created_date: new Date(),
                        // run_no: check_run_no
                    }
                })
            }
        }


        if (error.length > 0) {

            // clearTimeout(gas_timeout)

            const groupByCases = error.reduce((group, error) => {
                const { cases } = error;
                group[cases] = group[cases] ?? [];
                group[cases].push(error.index);
                return group;
            }, {});

            var error_str = JSON.stringify(groupByCases)
            insert_log(req, 'webhook equipmentvehicle', error_str.toString())

            return res.send(utilSetResponseJson('failed', error_str))
        }

        if (data_create.length > 0) {
            await EquipmentVehicle.insertMany(data_create).then(res => {
                insert_log(req, 'webhook equipmentvehicle', '')

            }).catch(error_str => {
                insert_log(req, 'webhook equipmentvehicle', error_str.toString())
                throw error_str
            })
        }
        if (data_update.length > 0) {
            for (let index = 0; index < data_update.length; index++) {
                const element = data_update[index];

                await EquipmentVehicle.replaceOne(
                    { _id: element[0] }, element[1]).then(res => {
                        insert_log(req, 'webhook equipmentvehicle', '')

                    }).catch(error_str => {
                        insert_log(req, 'webhook equipmentvehicle', error_str.toString())
                        throw error_str
                    })
            }
        }

        var data = await EquipmentVehicle.find()


        io.sockets.emit('equipmentvehicle', 'new')
        io.sockets.emit('notification', 'new')

        res.send(utilSetResponseJson('success', data))
    } catch (error) {
        res.send(utilSetResponseJson('failed', error.toString()))
    }
}

const vehicle = async (req, res) => {

    try {

        var application_id = '62a5c8003ec7e79898750deb'
        await permission(application_id, req)

        var io = await socket_io.getIo()

        // var check_run_no = await Equipment.findOne().sort({ 'others.run_no': -1 }).select('others.run_no')
        // check_run_no = _.isObject(check_run_no) ? check_run_no.others.run_no + 1 : 1

        var data_in_db = await Vehicle.find()
        var error = []

        var data_create = []
        var data_update = []

        for (let index = 0; index < req.body.length; index++) {
            const el = req.body[index];

            var WorkingStart = null
            var WorkingEnd = null

            if (el.WorkStartDate) {
                var new_date = new Date(el.WorkStartDate.replace(/\s/g, '') + ' ' + el.WorkStartTime.replace(/\s/g, ''))
                if (new_date != 'Invalid Date') {
                    WorkingStart = new_date
                } else {
                    error.push({ index: index, cases: 'WorkStartDate or WorkStartTime  invalid date' })
                }
            }


            if (el.WorkEndDate) {
                var new_date = new Date(el.WorkEndDate.replace(/\s/g, '') + ' ' + el.WorkEndTime.replace(/\s/g, ''))
                if (new_date != 'Invalid Date') {
                    WorkingEnd = new_date
                } else {
                    error.push({ index: index, cases: 'WorkEndDate or WorkEndTime  invalid date' })
                }
            }

            if (el.Remove_GPS) {
                var new_date = new Date(el.Remove_GPS)
                if (new_date != 'Invalid Date') {
                    // el.Remove_GPS = new_date
                } else {
                    error.push({ index: index, cases: 'Remove_GPS invalid date' })
                }
            }


            var check = data_in_db.filter((el1) => {
                return el1.VehicleID == el.VehicleID
            })

            if (check.length > 0) {
                data_update.push([
                    check[0]._id, {
                        ...el,
                        others: {
                            ...check[0].others,
                            WorkingStart,
                            WorkingEnd,
                            updated_date: new Date(),
                        }
                    }])

            } else {
                data_create.push({
                    ...el,
                    others: {
                        WorkingStart,
                        WorkingEnd,
                        created_date: new Date(),
                    }
                })
            }


        }


        if (error.length > 0) {

            const groupByCases = error.reduce((group, error) => {
                const { cases } = error;
                group[cases] = group[cases] ?? [];
                group[cases].push(error.index);
                return group;
            }, {});

            var error_str = JSON.stringify(groupByCases)
            insert_log(req, 'webhook vehicle', error_str.toString())

            return res.send(utilSetResponseJson('failed', error_str))
        }

        if (data_create.length > 0) {
            await Vehicle.insertMany(data_create).then(res => {
                insert_log(req, 'webhook vehicle', '')

            }).catch(error_str => {
                insert_log(req, 'webhook vehicle', error_str.toString())
                throw error_str
            })
        }
        if (data_update.length > 0) {
            for (let index = 0; index < data_update.length; index++) {
                const element = data_update[index];

                await Vehicle.replaceOne(
                    { _id: element[0] }, element[1]).then(res => {
                        insert_log(req, 'webhook vehicle', '')

                    }).catch(error_str => {
                        insert_log(req, 'webhook vehicle', error_str.toString())
                        throw error_str
                    })
            }
        }

        var data = await Vehicle.find()

        io.sockets.emit('vehicle', 'new')
        io.sockets.emit('notification', 'new')


        res.send(utilSetResponseJson('success', data))
    } catch (error) {
        res.send(utilSetResponseJson('failed', error.toString()))
    }
}
const vehicle2 = async (req, res) => {

    try {

        var application_id = '62a5c8003ec7e79898750deb'
        await permission(application_id, req)

        var io = await socket_io.getIo()

        // var check_run_no = await Equipment.findOne().sort({ 'others.run_no': -1 }).select('others.run_no')
        // check_run_no = _.isObject(check_run_no) ? check_run_no.others.run_no + 1 : 1

        var data_in_db = await Vehicle2.find()
        var error = []

        var data_create = []
        var data_update = []

        for (let index = 0; index < req.body.length; index++) {
            const el = req.body[index];


            if (el.Remove_Park) {
                var new_date = new Date(el.Remove_Park)
                if (new_date != 'Invalid Date') {
                    // el.Remove_Park = new_date
                } else {
                    error.push({ index: index, cases: 'Remove_Park invalid date' })
                }
            }


            var check = data_in_db.filter((el1) => {
                return el1.VehicleParkID == el.VehicleParkID
            })

            if (check.length > 0) {
                data_update.push([
                    check[0]._id, {
                        ...el,
                        others: {
                            ...check[0].others,
                            updated_date: new Date(),
                        }
                    }])

            } else {
                data_create.push({
                    ...el,
                    others: {
                        created_date: new Date(),
                    }
                })
            }

        }


        if (error.length > 0) {

            const groupByCases = error.reduce((group, error) => {
                const { cases } = error;
                group[cases] = group[cases] ?? [];
                group[cases].push(error.index);
                return group;
            }, {});

            var error_str = JSON.stringify(groupByCases)
            insert_log(req, 'webhook vehicle2', error_str.toString())

            return res.send(utilSetResponseJson('failed', error_str))
        }

        if (data_create.length > 0) {
            await Vehicle2.insertMany(data_create).then(res => {
                insert_log(req, 'webhook vehicle2', '')

            }).catch(error_str => {
                insert_log(req, 'webhook vehicle2', error_str.toString())
                throw error_str
            })
        }
        if (data_update.length > 0) {
            for (let index = 0; index < data_update.length; index++) {
                const element = data_update[index];

                await Vehicle2.replaceOne(
                    { _id: element[0] }, element[1]).then(res => {
                        insert_log(req, 'webhook vehicle2', '')

                    }).catch(error_str => {
                        insert_log(req, 'webhook vehicle2', error_str.toString())
                        throw error_str
                    })
            }
        }

        var data = await Vehicle2.find()

        io.sockets.emit('vehicle2', 'new')

        res.send(utilSetResponseJson('success', data))
    } catch (error) {
        res.send(utilSetResponseJson('failed', error.toString()))
    }
}
const vehicle5 = async (req, res) => {

    try {

        var application_id = '62a5c8003ec7e79898750deb'
        await permission(application_id, req)

        var io = await socket_io.getIo()

        // var check_run_no = await Equipment.findOne().sort({ 'others.run_no': -1 }).select('others.run_no')
        // check_run_no = _.isObject(check_run_no) ? check_run_no.others.run_no + 1 : 1

        // var data_in_db = await Vehicle5.find()
        var error = []

        var data_create = []
        var data_update = []

        for (let index = 0; index < req.body.length; index++) {
            const el = req.body[index];

            // var check = data_in_db.filter((el1) => {
            //     return el1.id == el.id
            // })

            // if (check.length > 0) {
            //     data_update.push([
            //         check[0]._id, {
            //             ...el,
            //             others: {
            //                 ...check[0].others,
            //                 updated_date: new Date(),
            //             }
            //         }])

            // } else {
            data_create.push({
                ...el,
                others: {
                    created_date: new Date(),
                }
            })
            // }

        }


        if (error.length > 0) {

            const groupByCases = error.reduce((group, error) => {
                const { cases } = error;
                group[cases] = group[cases] ?? [];
                group[cases].push(error.index);
                return group;
            }, {});

            var error_str = JSON.stringify(groupByCases)
            insert_log(req, 'webhook vehicle5', error_str.toString())

            return res.send(utilSetResponseJson('failed', error_str))
        }

        await Vehicle5.deleteMany()
        if (data_create.length > 0) {
            await Vehicle5.insertMany(data_create).then(res => {
                insert_log(req, 'webhook vehicle5', '')

            }).catch(error_str => {
                insert_log(req, 'webhook vehicle5', error_str.toString())
                throw error_str
            })
        }
        // if (data_update.length > 0) {
        //     for (let index = 0; index < data_update.length; index++) {
        //         const element = data_update[index];

        //         await Vehicle5.replaceOne(
        //             { _id: element[0] }, element[1])
        //     }
        // }

        var data = await Vehicle5.find()

        io.sockets.emit('vehicle5', 'new')

        res.send(utilSetResponseJson('success', data))
    } catch (error) {
        res.send(utilSetResponseJson('failed', error.toString()))
    }
}
const vehicle6 = async (req, res) => {

    try {

        var application_id = '62a5c8003ec7e79898750deb'
        await permission(application_id, req)

        var io = await socket_io.getIo()


        await Vehicle6.deleteMany()

        const el = req.body;

        data = {
            ...el,
            others: {
                created_date: new Date(),
            }
        }




        await Vehicle6.create(data).then(res => {
            insert_log(req, 'webhook vehicle6', '')

        }).catch(error_str => {
            insert_log(req, 'webhook vehicle6', error_str.toString())
            throw error_str
        })

        var data = await Vehicle6.findOne()

        io.sockets.emit('vehicle6', 'new')
        io.sockets.emit('notification', 'new')

        res.send(utilSetResponseJson('success', data))
    } catch (error) {
        res.send(utilSetResponseJson('failed', error.toString()))
    }
}
const people = async (req, res) => {

    try {

        var application_id = '62a5c8003ec7e79898750deb'
        await permission(application_id, req)

        var io = await socket_io.getIo()

        // var check_run_no = await Equipment.findOne().sort({ 'others.run_no': -1 }).select('others.run_no')
        // check_run_no = _.isObject(check_run_no) ? check_run_no.others.run_no + 1 : 1

        // var data_in_db = await People.find()
        var error = []

        var data_create = []
        var data_update = []

        for (let index = 0; index < req.body.length; index++) {
            const el = req.body[index];

            var WorkingStart = null
            var WorkingEnd = null

            if (el.WorkStartDate) {
                var new_date = new Date(el.WorkStartDate.replace(/\s/g, '') + ' ' + el.WorkStartTime.replace(/\s/g, ''))
                if (new_date != 'Invalid Date') {
                    WorkingStart = new_date
                } else {
                    error.push({ index: index, cases: 'WorkStartDate or WorkStartTime  invalid date' })
                }
            }


            if (el.WorkEndDate) {
                var new_date = new Date(el.WorkEndDate.replace(/\s/g, '') + ' ' + el.WorkEndTime.replace(/\s/g, ''))
                if (new_date != 'Invalid Date') {
                    WorkingEnd = new_date
                } else {
                    error.push({ index: index, cases: 'WorkEndDate or WorkEndTime  invalid date' })
                }
            }

            if (el.WarningStatusDateTime && el.WarningStatusDateTime.length > 0) {
                for (let index1 = 0; index1 < el.WarningStatusDateTime.length; index1++) {
                    const element = el.WarningStatusDateTime[index1];

                    var new_date = new Date(element)
                    if (new_date != 'Invalid Date') {
                        // el.WarningStatusDateTime = new_date
                    } else {
                        error.push({ index: index, cases: 'WarningStatusDateTime invalid date' })
                    }

                }

            }

            // var check = data_in_db.filter((el1) => {
            //     return el1.PersonalID == el.PersonalID
            // })

            // if (check.length > 0) {
            //     data_update.push([
            //         check[0]._id, {
            //             ...el,
            //             others: {
            //                 ...check[0].others,
            //                 WorkingStart,
            //                 WorkingEnd,
            //                 updated_date: new Date(),
            //             }
            //         }])

            // } else {
            data_create.push({
                ...el,
                others: {
                    WorkingStart,
                    WorkingEnd,
                    created_date: new Date(),
                }
            })
            // }


        }


        if (error.length > 0) {

            const groupByCases = error.reduce((group, error) => {
                const { cases } = error;
                group[cases] = group[cases] ?? [];
                group[cases].push(error.index);
                return group;
            }, {});

            var error_str = JSON.stringify(groupByCases)
            insert_log(req, 'webhook people', error_str.toString())

            return res.send(utilSetResponseJson('failed', error_str))
        }

        await People.deleteMany()
        if (data_create.length > 0) {
            await People.insertMany(data_create).then(res => {
                insert_log(req, 'webhook people', '')

            }).catch(error_str => {
                insert_log(req, 'webhook people', error_str.toString())
                throw error_str

            })
        }
        // if (data_update.length > 0) {
        //     for (let index = 0; index < data_update.length; index++) {
        //         const element = data_update[index];

        //         await People.replaceOne(
        //             { _id: element[0] }, element[1])
        //     }
        // }

        var data = await People.find()

        io.sockets.emit('people', 'new')
        io.sockets.emit('notification', 'new')


        res.send(utilSetResponseJson('success', data))
    } catch (error) {
        res.send(utilSetResponseJson('failed', error.toString()))
    }
}
const peopleRestrict = async (req, res) => {

    try {

        var application_id = '62a5c8003ec7e79898750deb'
        await permission(application_id, req)

        var io = await socket_io.getIo()

        // var check_run_no = await Equipment.findOne().sort({ 'others.run_no': -1 }).select('others.run_no')
        // check_run_no = _.isObject(check_run_no) ? check_run_no.others.run_no + 1 : 1

        // var data_in_db = await PeopleRestrict.find()
        var error = []

        var data_create = []
        var data_update = []

        for (let index = 0; index < req.body.length; index++) {
            const el = req.body[index];


            // var check = data_in_db.filter((el1) => {
            //     return el1.RestrictedAreaID == el.RestrictedAreaID
            // })

            // if (check.length > 0) {
            //     data_update.push([
            //         check[0]._id, {
            //             ...el,
            //             others: {
            //                 ...check[0].others,
            //                 updated_date: new Date(),
            //             }
            //         }])

            // } else {
            data_create.push({
                ...el,
                others: {
                    created_date: new Date(),
                }
            })
            // }

        }


        if (error.length > 0) {

            const groupByCases = error.reduce((group, error) => {
                const { cases } = error;
                group[cases] = group[cases] ?? [];
                group[cases].push(error.index);
                return group;
            }, {});

            var error_str = JSON.stringify(groupByCases)
            insert_log(req, 'webhook peoplerestrict', error_str.toString())

            return res.send(utilSetResponseJson('failed', error_str))
        }

        await PeopleRestrict.deleteMany()
        if (data_create.length > 0) {
            await PeopleRestrict.insertMany(data_create).then(res => {
                insert_log(req, 'webhook peoplerestrict', '')

            }).catch(error_str => {
                insert_log(req, 'webhook peoplerestrict', error_str.toString())
                throw error_str
            })
        }
        // if (data_update.length > 0) {
        //     for (let index = 0; index < data_update.length; index++) {
        //         const element = data_update[index];

        //         await PeopleRestrict.replaceOne(
        //             { _id: element[0] }, element[1])
        //     }
        // }

        var data = await PeopleRestrict.find()

        io.sockets.emit('peoplerestrict', 'new')

        res.send(utilSetResponseJson('success', data))
    } catch (error) {
        res.send(utilSetResponseJson('failed', error.toString()))
    }
}
export {
    addBasicAuth, getBasicAuth, scaffolding, workPermit,
    accessControl, accessControlPut, accessControlDevice, accessControlExchangeCard,
    equipment, equipmentVehicle, vehicle, vehicle2, vehicle5, vehicle6, people, peopleRestrict
};
