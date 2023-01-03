
import utilSetResponseJson from '../utils/util.SetResponseJson.js';
import AccessControl from "../models/AccessControl/AccessControl.js";
import _ from 'lodash'
import User from '../models/User/User.js';
import AccessControlDevice from '../models/AccessControlDevice/AccessControlDevice.js';
import e from 'express';
import { permission } from '../preHandlers/permission.js';
import moment from 'moment'
import axios from 'axios';
import config from '../utils/config.js';
import Role from '../models/Role/Role.js';
import Location from "../models/Master/Location/Location.js";
import WorkPermit from '../models/WorkPermit/WorkPermit.js';
import AccessControlExchangeCard from "../models/AccessControlExchangeCard/AccessControlExchangeCard.js";

const all = async (req, res) => {
    try {

        var application_id = '62a4d4fa22bdf92ba30d163b'
        await permission(application_id, req)


        var filter = {
            AgencyName: [{ AgencyName: 'ทั้งหมด' }],
            PTTStaffCode: [{ PTTStaffCode: 'ทั้งหมด', PTTStaff: 'ทั้งหมด' }],
            AccDeviceName: [{ AccDeviceName: 'ทั้งหมด' }],
            AreaName: [{ AreaName: 'ทั้งหมด' }],
            SubAreaName: [{ SubAreaName: 'ทั้งหมด' }],
            PersonalTypeName: [{ PersonalTypeName: 'ทั้งหมด' }],
            CompanyName: [{ CompanyName: 'ทั้งหมด' }],
            notification: [{ notification: 'ทั้งหมด' }],
        }
        var where_permission = {}
        var data = {}
        var all = 0
        var In = 0
        var Out = 0
        var exchange_card_in = 0
        var exchange_card_out = 0
        var on_plant = 0
        var online = 0
        var offline = 0
        var data_arr = []


        // var check_run_no = await AccessControlDevice.findOne().sort({ 'others.run_no': -1 }).select('others.run_no')
        // check_run_no = _.isObject(check_run_no) ? check_run_no.others.run_no : 0
        var AccDeviceName_master = await AccessControlDevice.find({
            // $and: [
            //     {
            //         'others.run_no': check_run_no
            //     }
            // ]
        })
        var AreaName_master = await Location.find()


        var CardType_master = [
            { CardTypeID: '1', CardTypeName: 'ผู้มาติดต่อ' },
            { CardTypeID: '2', CardTypeName: 'ผู้เยี่ยมชม' },
            { CardTypeID: '3', CardTypeName: 'ผู้รับเหมาชั่วคราว' },
            { CardTypeID: '4', CardTypeName: 'ผู้รับเหมาประจำ' },
            { CardTypeID: '5', CardTypeName: 'นักศึกษาฝึกงาน' },
            { CardTypeID: '6', CardTypeName: 'พนักงานสรรพสามิต/ราชการ/ลูกค้า' },
            { CardTypeID: '7', CardTypeName: 'พนักงาน ปตท. โครงการ' }
        ]

        var PersonalType_master = [
            { PersonalTypeID: '0', PersonalTypeName: 'พนักงาน ปตท. (สังกัด ผยก.)' },
            { PersonalTypeID: '1', PersonalTypeName: 'พนักงานสรรพสามิต/ราชการ/ลูกค้า' },
            { PersonalTypeID: '2', PersonalTypeName: 'ทดสอบผู้มาติดต่อ' },
            { PersonalTypeID: '3', PersonalTypeName: 'ผู้รับเหมาประจำ' },
            { PersonalTypeID: '5', PersonalTypeName: 'ผู้เยี่ยมชม' },
            { PersonalTypeID: '6', PersonalTypeName: 'ผู้รับเหมาชั่วคราว' },
            { PersonalTypeID: '7', PersonalTypeName: 'นักศึกษาฝึกงาน' },
            { PersonalTypeID: '8', PersonalTypeName: 'ผู้มาติดต่อ' }
        ]

        var AgencyName = (req) ? (req.query.AgencyName && !req.query.AgencyName.toString().includes('ทั้งหมด')) ? req.query.AgencyName : undefined : undefined
        AgencyName = (AgencyName) ? { AgencyName: { $in: AgencyName } } : {}

        var PTTStaffCode = (req) ? (req.query.PTTStaffCode && !req.query.PTTStaffCode.toString().includes('ทั้งหมด')) ? req.query.PTTStaffCode : undefined : undefined
        PTTStaffCode = (PTTStaffCode) ? { PTTStaffCode: { $in: PTTStaffCode } } : {}


        var AreaName = (req) ? (req.query.AreaName && !req.query.AreaName.toString().includes('ทั้งหมด')) ? req.query.AreaName : undefined : undefined
        AreaName = (AreaName) ? { AreaName: { $in: AreaName } } : {}

        var SubAreaName = (req) ? (req.query.SubAreaName && !req.query.SubAreaName.toString().includes('ทั้งหมด')) ? req.query.SubAreaName : undefined : undefined
        SubAreaName = (SubAreaName) ? { SubAreaName: { $in: SubAreaName } } : {}

        var Scan_Date_Time_Start = (req) ? req.query.Scan_Date_Time_Start : undefined
        Scan_Date_Time_Start = (Scan_Date_Time_Start) ? { 'others.scan_date_time': { $gte: Scan_Date_Time_Start } } : {}


        var Scan_Date_Time_End = (req) ? req.query.Scan_Date_Time_End : undefined
        Scan_Date_Time_End = (Scan_Date_Time_End) ? { 'others.scan_date_time': { $lte: Scan_Date_Time_End } } : {}

        var AccDeviceName = (req) ? (req.query.AccDeviceName && !req.query.AccDeviceName.toString().includes('ทั้งหมด')) ? req.query.AccDeviceName : undefined : undefined
        if (AccDeviceName) {
            AccDeviceName = AccDeviceName_master.filter(el => { return AccDeviceName.includes(el.AccDeviceName) })
            if (AccDeviceName.length == 0) {
                if (res)
                    return res.send(utilSetResponseJson('failed', 'AccDeviceName not found'))
                return utilSetResponseJson('failed', 'AccDeviceName not found')
            }
            AccDeviceName = AccDeviceName[0].AccDeviceID
        }
        AccDeviceName = (AccDeviceName) ? { ACC_ID: AccDeviceName } : {}


        var PersonalTypeName = (req) ? (req.query.PersonalTypeName && !req.query.PersonalTypeName.toString().includes('ทั้งหมด')) ? req.query.PersonalTypeName : undefined : undefined
        if (PersonalTypeName) {
            PersonalTypeName = PersonalType_master.filter(el => { return PersonalTypeName.includes(el.PersonalTypeName) })
            if (PersonalTypeName.length == 0) {
                if (res)
                    return res.send(utilSetResponseJson('failed', 'PersonalTypeName not found'))
                return utilSetResponseJson('failed', 'AccDeviceName not found')
            }

            PersonalTypeName = PersonalTypeName.map(el => { return el.PersonalTypeID })
        }
        PersonalTypeName = (PersonalTypeName) ? { PersonalTypeID: { $in: PersonalTypeName } } : {}

        var CompanyName = (req) ? (req.query.CompanyName && !req.query.CompanyName.toString().includes('ทั้งหมด')) ? req.query.CompanyName : undefined : undefined
        CompanyName = (CompanyName) ? { CompanyName: { $in: CompanyName } } : {}

        var Notification = (req) ? (req.query.notification && !req.query.notification.toString().includes('ทั้งหมด')) ? req.query.notification : [] : []

        var check_user = await User.findOne().where({ _id: req._id })

        var now = new Date
        var day_7 = new Date().setDate(new Date().getDate() + 7);

        //เจ้าของพื้นที่
        if (check_user.group_id == "62a4cad5e0a99b4456aaf514") {
            // if (Object.keys(req.query).length === 0) {
            //     var location1 = await WorkPermit.find({ approverCode: check_user.others.employeeid })
            //     var test = await WorkPermit.find({ location: { $in: location1.map(el => { return el.location }) } })
            //     where_permission = { WorkPermitID: { $in: test.map(el => { return el.workPermitID }) } }

            // }
        }
        //ผู้ควบคุมงาน ปตท.
        else if (check_user.group_id == "62a4cb17e0a99b4456aaf51e") {
            if (Object.keys(req.query).length === 0) {
                where_permission = { PTTStaffCode: check_user.others.employeeid }
            }
        }
        //เจ้าหน้าที่รักษาความปลอดภัย
        else if (check_user.group_id == "62a4cb26e0a99b4456aaf522") {

        }
        //หน่วยงาน ปภ.ผยก.
        else if (check_user.group_id == "62a4cb5896deebf8a1f8abbe") {
        }

        //ผู้ดูแลระบบ
        else if (check_user.group_id == "62a4cb7696deebf8a1f8abc9") {

        }


        var role = await Role.find().where({ group_id: check_user.group_id })

        var all = 0
        var In = 0
        var Out = 0
        var exchange_card_in = 0
        var exchange_card_out = 0
        var on_plant = 0
        var online = 0
        var offline = 0
        var main_plant = 0

        // แสดงภาพรวมบุคคลที่เข้า - ออก พื้นที่ โดย มี Icon แสดงแยกตามประเภทกลุ่มบุคคล และแสดงจำนวนบุคคลเข้า-ออก (ใช้ข้อมูลจากพื้นที่ที่สแกนอุปกรณ์ล่าสุด)
        var over_all_check = role.filter((el) => { return el.application_id == '630cfaef11450344aa59db85' })

        // การสแกนบัตรเข้า - ออก
        var In_Out_check = role.filter((el) => { return el.application_id == '630cfb0611450344aa59db91' })

        //การแลกบัตรเข้า - ออก
        var exchange_card_in_out_check = role.filter((el) => { return el.application_id == '630cfb1811450344aa59db97' })

        //บุคคลที่อยู่ในพื้นที่
        var on_plant_check = role.filter((el) => { return el.application_id == '630cfb2b11450344aa59db9d' })

        //อุปกรณ์ online offline
        var online_offline_check = role.filter((el) => { return el.application_id == '630cfb4a11450344aa59dba3' })

        //ใช้ฟังก์ชันการค้นหาข้อมูล โดยเมนู Search สามารถทำการเปิด-ปิด หน้าต่างการค้นหาได้ เพื่อเพิ่มพื้นที่การแสดงผลของ Dashboard
        var search_check = role.filter((el) => { return el.application_id == '630cfb6011450344aa59dba9' })

        await AccessControl.find({
            // $and: [
            //     where_permission
            // ]
        }).then((result) => {
            for (let index = 0; index < result.length; index++) {
                const element = result[index]._doc;

                if (filter.AgencyName.some(e => e.AgencyName === element.AgencyName) == false) {
                    filter.AgencyName.push({ AgencyName: element.AgencyName })
                }
                if (req.query.AgencyName) {
                    if (req.query.AgencyName.toString().includes(element.AgencyName) || req.query.AgencyName.toString().includes('ทั้งหมด')) {
                        if (filter.PTTStaffCode.some(e => e.PTTStaffCode === element.PTTStaffCode) == false) {
                            filter.PTTStaffCode.push({ PTTStaffCode: element.PTTStaffCode, PTTStaff: element.PTTStaffFirstName + ' ' + element.PTTStaffLastName })
                        }
                    }
                } else {
                    if (filter.PTTStaffCode.some(e => e.PTTStaffCode === element.PTTStaffCode) == false) {
                        filter.PTTStaffCode.push({ PTTStaffCode: element.PTTStaffCode, PTTStaff: element.PTTStaffFirstName + ' ' + element.PTTStaffLastName })
                    }
                }

                var join_access_control_device = AccDeviceName_master.filter(el => { return el.AccDeviceID == element.ACC_ID })

                if (join_access_control_device.length > 0) {
                    element.AccDevice = join_access_control_device[0]
                } else {
                    element.AccDevice = null
                }

                if (element.ACC_ID && element.AccDevice) {

                    element.AreaName = element.AccDevice.AreaName
                    element.SubAreaName = element.AccDevice.SubAreaName

                    if (filter.AreaName.some(e => e.AreaName === element.AreaName) == false) {
                        filter.AreaName.push({
                            ...(AreaName_master.filter(el => { return el.Location_Name == element.AreaName })[0]) ?
                                AreaName_master.filter(el => { return el.Location_Name == element.AreaName })[0]._doc : {},
                            AreaName: element.AreaName
                        })
                    }
                }


                if (req.query.AreaName) {
                    if (req.query.AreaName.toString().includes(element.AreaName) || req.query.AreaName.toString().includes('ทั้งหมด')) {
                        if (filter.SubAreaName.some(e => e.SubAreaName === element.SubAreaName) == false) {
                            filter.SubAreaName.push({
                                SubAreaName: element.SubAreaName
                            })
                        }
                    }
                } else {
                    if (filter.SubAreaName.some(e => e.SubAreaName === element.SubAreaName) == false) {
                        filter.SubAreaName.push({
                            SubAreaName: element.SubAreaName
                        })
                    }
                }



                if (filter.PersonalTypeName.some(e => e.PersonalTypeID === element.PersonalTypeID) == false) {
                    var check_in_master = PersonalType_master.filter(el => { return el.PersonalTypeID == element.PersonalTypeID })
                    filter.PersonalTypeName.push({
                        ...(check_in_master[0]) ? check_in_master[0] : {}, PersonalTypeID: element.PersonalTypeID
                    })
                }


                if (filter.CompanyName.some(e => e.CompanyName === element.CompanyName) == false) {
                    filter.CompanyName.push({ CompanyName: element.CompanyName })
                }


            }
        })

        filter.AccDeviceName = filter.AccDeviceName.concat(AccDeviceName_master)

        var exchange = await AccessControlExchangeCard.findOne()
        if (exchange) {
            exchange_card_in = parseInt(exchange.ExchangeCardIn)
            exchange_card_out = parseInt(exchange.ExchangeCardOut)
        }


        // if (typeof req.query.AreaName == 'string') {
        //     req.query.AreaName = [req.query.AreaName]
        // }
        // if (typeof req.query.SubAreaName == 'string') {
        //     req.query.SubAreaName = [req.query.SubAreaName]
        // }

        await AccessControl.find({
            $and: [
                where_permission,
                PTTStaffCode,
                AgencyName,
                Scan_Date_Time_Start,
                Scan_Date_Time_End,
                AccDeviceName,
                CompanyName,
                PersonalTypeName
            ]
        }).then((result) => {
            for (let index = 0; index < result.length; index++) {
                const element = result[index]._doc;
                element.notification = {}

                var join_access_control_device = AccDeviceName_master.filter(el => { return el.AccDeviceID == element.ACC_ID })

                if (join_access_control_device.length > 0) {
                    element.AccDevice = join_access_control_device[0]
                } else {
                    element.AccDevice = null
                }

                var join_personal_type = PersonalType_master.filter(el => { return el.PersonalTypeID == element.PersonalTypeID })
                element.PersonalTypeName = (join_personal_type.length > 0) ? join_personal_type[0] : null

                if (element.ACC_ID && element.AccDevice) {
                    element.AreaName = element.AccDevice.AreaName
                    element.SubAreaName = element.AccDevice.SubAreaName

                }


                if (req.query.AreaName && !req.query.AreaName.includes(element.AreaName)) {
                    continue
                }
                if (req.query.SubAreaName && !req.query.SubAreaName.includes(element.SubAreaName)) {
                    continue
                }


                var CardTypeName = CardType_master.filter(el => { return el.CardTypeID == element.CardTypeID })
                element.others.CardTypeName = (CardTypeName.length > 0) ? CardTypeName[0].CardTypeName : null


                var PersonalTypeName = PersonalType_master.filter(el => { return el.PersonalTypeID == element.PersonalTypeID })

                if (PersonalTypeName.length > 0) {
                    element.others.PersonalTypeName = PersonalTypeName[0].PersonalTypeName
                } else {
                    element.others.PersonalTypeName = null
                }

                const today = moment().startOf('day')

                if (element.ScanStatus == '0') {
                    element.others.ScanStatus_Name = 'ยังไม่ผ่านการสแกน'
                }
                else if (element.ScanStatus == '1') {
                    if (element.others.ScanDateTime1 >= today.toDate() && element.others.ScanDateTime1 <= moment(today).endOf('day').toDate()) {
                        In = In + 1
                    }
                    element.others.ScanStatus_Name = 'สแกนเข้า'
                }
                else if (element.ScanStatus == '2') {
                    if (element.others.ScanDateTime2 >= today.toDate() && element.others.ScanDateTime2 <= moment(today).endOf('day').toDate()) {
                        Out = Out + 1
                    }
                    element.others.ScanStatus_Name = 'สแกนออก'
                }

                if (element.OnPlant == true && element.AccDevice && element.AccDevice.AreaID != 0) {
                    on_plant = on_plant + 1
                    element.others.show_in_map = true
                    element.others.on_plant = true
                } else {
                    element.others.show_in_map = false
                    element.others.on_plant = false
                }

                // if (exchange_card_in_out_check.length > 0) {
                if (element.ExchangeCardStatus == '1') {
                    if (element.others.ExchangeCardDateTime1 >= today.toDate() && element.others.ExchangeCardDateTime1 <= moment(today).endOf('day').toDate()) {
                        // exchange_card_in = exchange_card_in + 1
                    }
                    element.others.ExchangeCard_Status_Name = 'แลกบัตรเข้า'
                }
                else if (element.ExchangeCardStatus == '2') {
                    if (element.others.ExchangeCardDateTime2 >= today.toDate() && element.others.ExchangeCardDateTime2 <= moment(today).endOf('day').toDate()) {
                        // exchange_card_out = exchange_card_out + 1
                    }
                    element.others.ExchangeCard_Status_Name = 'แลกบัตรออก'
                }
                else if (element.ExchangeCardStatus == '3') {
                    // exchange_card_out = exchange_card_out + 1
                    element.others.ExchangeCard_Status_Name = 'De-Activate'
                }
                else if (element.ExchangeCardStatus == '4') {
                    // exchange_card_out = exchange_card_out + 1
                    element.others.ExchangeCard_Status_Name = 'Activate'
                }
                // }
                // delete element._id
                // delete element.__v

                element.others.on_table = true

                all = all + 1
                data_arr.push(element)


            }
        })


        var data_length = data_arr.length


        var AccDeviceName = (req) ? req.query.AccDeviceName : undefined
        AccDeviceName = (AccDeviceName) ? { AccDeviceName: AccDeviceName } : {}

        if (online_offline_check.length > 0) {
            filter.notification.push({ notification: 'offline' })
        }

        var Notification_ = {}
        if (typeof Notification == 'string') {
            Notification = [Notification]
        }
        if (Notification.length > 0) {
            Notification_.$or = []
        }
        if (Notification.includes('offline')) {
            Notification_.$or.push({ AccDeviceStatus: '0' })
        }


        var data_device = await AccessControlDevice.find({
            $and: [
                AreaName,
                SubAreaName,
                AccDeviceName,
                Notification_
            ]
        })


        for (let index = 0; index < data_device.length; index++) {
            const element = data_device[index]._doc;
            element.notification = {}

            element.others.show_in_map = true
            element.others.on_table = false


            var notification = {
                offline: false
            }

            if (element.AccDeviceStatus == '0') {
                offline = offline + 1
                notification.offline = true
                element.others.AccDeviceStatus = 'offline'

            } else if (element.AccDeviceStatus == '1') {
                online = online + 1
                element.others.AccDeviceStatus = 'online'
            }

            if (online_offline_check.length > 0) {
                element.notification.offline = notification.offline

            }

            data_arr.push(element)

        }


        var data = {}
        data.summary = {}
        data.filter = {}
        data.data = []

        if (over_all_check.length > 0) {

            data.summary = {
                all: all,
            }
            if (In_Out_check.length > 0) {
                data.summary.in = In
                data.summary.out = Out
            }

            if (exchange_card_in_out_check.length > 0) {
                data.summary.exchange_card_in = exchange_card_in
                data.summary.exchange_card_out = exchange_card_out
            }

            if (on_plant_check.length > 0) {
                data.summary.on_plant = on_plant
            }
            if (online_offline_check.length > 0) {
                data.summary.offline = offline
                data.summary.online = online
            }
            data.summary.main_plant = exchange_card_in - In

            data.data = data_arr
        }

        if (search_check.length > 0) {
            data.filter = filter
        }

        var data_ = {
            Status: 'success',
            Message: data
        }
        if (check_user.others.employeeid && check_user.group_id == "62a4cb17e0a99b4456aaf51e" && Object.keys(req.query).length === 0 && data_length == 0) {
            data_.MessageAlert = 'ไม่พบข้อมูลใบงานที่คุณเป็นผู้ควบคุมงาน กรุณาทำการค้นหาข้อมูลที่ต้องการ'
        }
        res.send(data_)
        // if (res)
        //     return res.send(utilSetResponseJson('success', data))
        // return utilSetResponseJson('success', data)
    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson('failed', error.toString()))
        return utilSetResponseJson('failed', error.toString())
    }
}

const test = async (res) => {

    return utilSetResponseJson('success', 'data')
}

export { all, test };