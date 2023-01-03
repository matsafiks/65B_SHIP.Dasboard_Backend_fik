
import utilSetResponseJson from '../utils/util.SetResponseJson.js';
import Scaffolding from "../models/Scaffolding/Scaffolding.js";
import Location from "../models/Master/Location/Location.js";
import modelScaffoldingType from "../models/Master/ScaffoldingType/ScaffoldingType.js";
import _ from 'lodash'
import User from '../models/User/User.js';
import { permission } from '../preHandlers/permission.js';
import Role from '../models/Role/Role.js';
import socket_io from "../utils/socket_io.js";
import config from '../utils/config.js';

const all = async (req, res) => {

    try {


        var application_id = '62a4d4c622bdf92ba30d1633'
        await permission(application_id, req)

        var filter = {
            AgencyName: [{ AgencyName: 'ทั้งหมด' }],
            PTTStaffCode: [{ PTTStaffCode: 'ทั้งหมด', PTTStaff: 'ทั้งหมด', }],
            AreaName: [{ AreaName: 'ทั้งหมด' }],
            SubAreaName: [{ SubAreaName: 'ทั้งหมด' }],
            ScaffoldingType: [{ ScaffoldingType: 'ทั้งหมด' }],
            VendorName: [{ VendorName: 'ทั้งหมด' }],
            notification: [{ notification: 'ทั้งหมด' }],
        }
        var where_permission = {}
        var all = 0
        var expire = 0
        var near_expire = 0
        var normal = 0
        var no_check = 0
        var data_arr = []


        var AgencyName = (req) ? (req.query.AgencyName && !req.query.AgencyName.toString().includes('ทั้งหมด')) ? req.query.AgencyName : undefined : undefined
        AgencyName = (AgencyName) ? { AgencyName: { $in: AgencyName } } : {}

        var PTTStaffCode = (req) ? (req.query.PTTStaffCode && !req.query.PTTStaffCode.toString().includes('ทั้งหมด')) ? req.query.PTTStaffCode : undefined : undefined
        PTTStaffCode = (PTTStaffCode) ? { PTTStaffCode: { $in: PTTStaffCode } } : {}

        var WorkingStartDate = (req) ? req.query.WorkingStartDate : undefined
        WorkingStartDate = (WorkingStartDate) ? { WorkingStartDate: { $gte: WorkingStartDate } } : {}

        var WorkingEndDate = (req) ? req.query.WorkingEndDate : undefined
        WorkingEndDate = (WorkingEndDate) ? { WorkingEndDate: { $lte: WorkingEndDate } } : {}


        var AreaName = (req) ? (req.query.AreaName && !req.query.AreaName.toString().includes('ทั้งหมด')) ? req.query.AreaName : undefined : undefined
        AreaName = (AreaName) ? { AreaName: { $in: AreaName } } : {}

        var SubAreaName = (req) ? (req.query.SubAreaName && !req.query.SubAreaName.toString().includes('ทั้งหมด')) ? req.query.SubAreaName : undefined : undefined
        SubAreaName = (SubAreaName) ? { SubAreaName: { $in: SubAreaName } } : {}

        var VendorName = (req) ? (req.query.VendorName && !req.query.VendorName.toString().includes('ทั้งหมด')) ? req.query.VendorName : undefined : undefined
        VendorName = (VendorName) ? { VendorName: { $in: VendorName } } : {}
        // var ScaffoldingType = (req) ? (req.query.ScaffoldingType) ? req.query.ScaffoldingType : undefined : undefined
        // ScaffoldingType = (ScaffoldingType) ? { ScaffoldingType: { $in: ScaffoldingType } } : {}

        var ScaffoldingType = (req) ? (req.query.ScaffoldingType && !req.query.ScaffoldingType.toString().includes('ทั้งหมด')) ? req.query.ScaffoldingType : undefined : undefined
        if (ScaffoldingType) {
            var ScaffoldingType_ = {
                $or: [
                    {
                        ScaffoldingType: {
                            $in: []
                        }
                    }
                ]
            }
            for (let index = 0; index < ScaffoldingType.length; index++) {
                const element = ScaffoldingType[index];
                if (element.split(' - ').length > 1) {
                    ScaffoldingType_.$or.push({
                        ScaffoldingType: element.split(' - ')[0],
                        ScaffoldingSubType: element.split(' - ')[1],
                    })
                } else {
                    ScaffoldingType_.$or[0].ScaffoldingType.$in.push(element)
                }

            }

            ScaffoldingType = ScaffoldingType_

        } else {
            ScaffoldingType = {}
        }



        var Notification = (req) ? (req.query.notification && !req.query.notification.toString().includes('ทั้งหมด')) ? req.query.notification : [] : []
        // Notification = (notification) ? { notification: { $in: notification } } : {}
        // Notification = (Notification) ? Notification : undefined


        var check_user = await User.findOne().where({ _id: req._id })

        var now = new Date
        var day_7 = new Date().setDate(new Date().getDate() + 7);

        //เจ้าของพื้นที่
        if (check_user.group_id == "62a4cad5e0a99b4456aaf514") {

            // if (Object.keys(req.query).length === 0) {
            //     var location1 = await Scaffolding.find({ Owner: check_user.others.employeeid })
            //     where_permission = { AreaName: { $in: location1.map(el => { return el.AreaName }) } }

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


        // แสดงภาพรวมการติดตั้งนั่งร้าน โดยมี Icon สี แสดงจุดที่มีการติดตั้งนั่งร้าน
        var over_all_check = role.filter((el) => { return el.application_id == '62dd28ce8b1b54286bab741b' })

        // แสดงการแจ้งเตือนกรณีนั่งร้านที่ติดตั้งในพื้นที่หมดอายุการตรวจสภาพ โดยมี Icon สี เพื่อแจ้งเตือน
        var expire_check = role.filter((el) => { return el.application_id == '62dd29333eb3c4301b4af56d' })

        //การแจ้งเตือนกรณีนั่งร้านที่ติดตั้งในพื้นที่ใกล้หมดอายุการตรวจสภาพ, หมดอายุการตรวจสภาพ โดยมี Icon สี เพื่อแจ้งเตือนสถานะ
        var near_expire_check = role.filter((el) => { return el.application_id == '62dd29713eb3c4301b4af57b' })

        //ใช้ฟังก์ชันการค้นหาข้อมูล โดยเมนู Search สามารถทำการเปิด-ปิด หน้าต่างการค้นหาได้ เพื่อเพิ่มพื้นที่การแสดงผลของ Dashboard
        var search_check = role.filter((el) => { return el.application_id == '62dd299c3eb3c4301b4af58c' })


        // แสดงการแจ้งเตือนยังไม่ได้ตรวจสอบ
        var no_check_check = role.filter((el) => { return el.application_id == '62fb3a4268c0cc7688e9f9e5' })


        var AreaName_master = await Location.find()
        var ScaffoldingType_master = await modelScaffoldingType.find()


        //delete row
        await Scaffolding.deleteMany({
            RemoveDate: { $lte: new Date().toISOString(), $ne: "" }
        })


        await Scaffolding.find({
            // $and: [
            //     where_permission
            // ]
        }).then((result) => {

            for (let index = 0; index < result.length; index++) {
                const element = result[index];

                if (filter.AgencyName.some(e => e.AgencyName === element.AgencyName) == false) {
                    filter.AgencyName.push({ AgencyName: element.AgencyName })
                }
                if (req.query.AgencyName) {
                    if (req.query.AgencyName.toString().includes(element.AgencyName) || req.query.AgencyName.toString().includes('ทั้งหมด')) {
                        if (filter.PTTStaffCode.some(e => e.PTTStaffCode === element.PTTStaffCode) == false) {
                            filter.PTTStaffCode.push({ PTTStaffCode: element.PTTStaffCode, PTTStaff: element.PTTStaff })
                        }
                    }
                } else {
                    if (filter.PTTStaffCode.some(e => e.PTTStaffCode === element.PTTStaffCode) == false) {
                        filter.PTTStaffCode.push({ PTTStaffCode: element.PTTStaffCode, PTTStaff: element.PTTStaff })
                    }
                }

                if (filter.AreaName.some(e => e.AreaName === element.AreaName) == false) {
                    filter.AreaName.push({
                        ...(AreaName_master.filter(el => { return el.Location_Name == element.AreaName })[0]) ?
                            AreaName_master.filter(el => { return el.Location_Name == element.AreaName })[0]._doc : {},
                        AreaName: element.AreaName
                    })
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

                var test = ''
                if (element.ScaffoldingSubType) {
                    test = test = element.ScaffoldingType + ' - ' + element.ScaffoldingSubType
                } else {
                    test = element.ScaffoldingType
                }

                if (filter.ScaffoldingType.some(e => e.ScaffoldingType === test) == false) {
                    filter.ScaffoldingType.push({ ScaffoldingType: test })
                }

                if (filter.VendorName.some(e => e.VendorName === element.VendorName) == false) {
                    filter.VendorName.push({ VendorName: element.VendorName })
                }


            }
        })

        if (expire_check.length > 0) {
            filter.notification.push({ notification: 'expire' })
        }

        if (near_expire_check.length > 0) {
            filter.notification.push({ notification: 'near_expire' })
        }

        if (no_check_check.length > 0) {
            filter.notification.push({ notification: 'no_check' })

        }


        var Notification_ = {}
        if (typeof Notification == 'string') {
            Notification = [Notification]
        }
        if (Notification.length > 0) {
            Notification_.$or = []
        }
        if (Notification.includes('expire')) {
            Notification_.$or.push({ WarningStatusID: '19' })
        }
        if (Notification.includes('near_expire')) {
            Notification_.$or.push({ WarningStatusID: '20' })
        }
        if (Notification.includes('no_check')) {
            Notification_.$or.push({ WarningStatusID: '22' })
        }

        await Scaffolding.find({
            $and: [
                where_permission,
                PTTStaffCode,
                AgencyName,
                WorkingStartDate,
                WorkingEndDate,
                AreaName,
                SubAreaName,
                ScaffoldingType,
                VendorName,
                Notification_
            ]
        }).then((result) => {
            for (let index = 0; index < result.length; index++) {

                var notification = {
                    expire: false,
                    near_expire: false,
                    no_check: false
                }

                const element = result[index]._doc;
                element.notification = {}

                //new
                if (element.WarningStatusID.toString() == '19') {
                    expire = expire + 1
                    element.others.StatusName = 'expire'
                    notification.expire = true

                }
                else if (element.WarningStatusID.toString() == '20') {
                    near_expire = near_expire + 1
                    element.others.StatusName = 'near_expire'
                    notification.near_expire = true

                }
                else if (element.WarningStatusID.toString() == '22') {
                    no_check = no_check + 1
                    element.others.StatusName = 'no_check'
                    notification.no_check = true

                }
                else {
                    if (Notification.length == 0) {
                        normal = normal + 1
                        element.others.StatusName = 'normal'
                    }

                }


                if (expire_check.length > 0) {
                    element.notification.expire = notification.expire
                }

                if (near_expire_check.length > 0) {
                    element.notification.near_expire = notification.near_expire
                }
                if (no_check_check.length > 0) {
                    element.notification.no_check = notification.no_check
                }



                delete element._id
                delete element.__v

                data_arr.push(element)
                all = all + 1



            }
        })
        var data = {}
        data.summary = {}
        data.filter = {}
        data.data = []


        if (over_all_check.length > 0) {

            data.summary = {
                all: all,
                normal: normal
            }
            if (expire_check.length > 0) {
                data.summary.expire = expire
            }

            if (near_expire_check.length > 0) {
                data.summary.near_expire = near_expire
            }

            if (no_check_check.length > 0) {
                data.summary.no_check = no_check
            }
            data.data = data_arr
        }

        if (search_check.length > 0) {
            data.filter = filter
        }

        var data_ = {
            Status: 'success',
            Message: data
        }
        if (check_user.others.employeeid && check_user.group_id == "62a4cb17e0a99b4456aaf51e" && Object.keys(req.query).length === 0 && data_arr.length == 0) {
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
