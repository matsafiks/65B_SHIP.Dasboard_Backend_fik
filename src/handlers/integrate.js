
import utilSetResponseJson from '../utils/util.SetResponseJson.js';
import Scaffolding from "../models/Scaffolding/Scaffolding.js";
import Location from "../models/Master/Location/Location.js";
import modelScaffoldingType from "../models/Master/ScaffoldingType/ScaffoldingType.js";
import _ from 'lodash'
import User from '../models/User/User.js';
import { permission } from '../preHandlers/permission.js';
import Role from '../models/Role/Role.js';
import WorkPermit from '../models/WorkPermit/WorkPermit.js';
import WorkpermitStatus from '../models/Master/WorkpermitStatus/WorkpermitStatus.js';
import AccessControlDevice from '../models/AccessControlDevice/AccessControlDevice.js';
import Equipment from '../models/Equipment/Equipment.js';
import EquipmentVehicle from '../models/EquipmentVehicle/EquipmentVehicle.js';
import People from '../models/People/People.js';
import Vehicle from "../models/Vehicle/Vehicle.js";
import Vehicle6 from '../models/Vehicle6/Vehicle6.js';
import Vehicle5 from '../models/Vehicle5/Vehicle5.js';
import moment from "moment"


const scaffolding = async (req, res) => {

    try {

        var application_id = '62f762cb112721673fda40d7'
        await permission(application_id, req)

        var data_arr = []
        var scaffolding_all = 0
        var where_permission_scaffolding = {}
        var ScaffoldingType = {}
        var expire = 0
        var near_expire = 0
        var normal = 0
        var no_check = 0


        var filter = {
            AgencyName: [{ AgencyName: "ทั้งหมด" }],
            PTTStaffCode: [{ PTTStaffCode: "ทั้งหมด", PTTStaff: "ทั้งหมด" }],
            AreaName: [{ AreaName: "ทั้งหมด" }],
            SubAreaName: [{ SubAreaName: "ทั้งหมด" }],
            WPM_AreaName: [{ WPM_AreaName: "ทั้งหมด" }],
            WPM_SubAreaName: [{ WPM_SubAreaName: "ทั้งหมด" }],
            AccDeviceName: [{ AccDeviceName: "ทั้งหมด" }],
            PeopleType: [{ PeopleType: "ทั้งหมด" }],
            VehicleType: [{ VehicleType: "ทั้งหมด" }],
            CompanyName: [{ CompanyName: "ทั้งหมด" }],
        }

        var check_user = await User.findOne().where({ _id: req._id })


        //เจ้าของพื้นที่
        if (check_user.group_id == "62a4cad5e0a99b4456aaf514") {
            // if (Object.keys(req.query).length === 0) {
            //     var location1 = await Scaffolding.find({ Owner: check_user.others.employeeid })
            //     where_permission_scaffolding = { AreaName: { $in: location1.map(el => { return el.AreaName }) } }

            // }
        }
        //ผู้ควบคุมงาน ปตท.
        else if (check_user.group_id == "62a4cb17e0a99b4456aaf51e") {
            if (Object.keys(req.query).length === 0) {
                where_permission_scaffolding = { PTTStaffCode: check_user.others.employeeid }
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

        //แสดงหมุดของ scaffolding
        var scaffolding_map_check = role.filter((el) => { return el.application_id == '62f7655c112721673fda41dc' })

        //ตัวเลขแสดงจำนวนนั่งร้าน
        var scaffolding_amount_check = role.filter((el) => { return el.application_id == '62f764f1112721673fda41ca' })

        var AgencyName = (req) ? (req.query.AgencyName && !req.query.AgencyName.toString().includes('ทั้งหมด')) ? req.query.AgencyName : undefined : undefined
        AgencyName = (AgencyName) ? { AgencyName: { $in: AgencyName } } : {}

        var PTTStaffCode = (req) ? (req.query.PTTStaffCode && !req.query.PTTStaffCode.toString().includes('ทั้งหมด')) ? req.query.PTTStaffCode : undefined : undefined
        PTTStaffCode = (PTTStaffCode) ? { PTTStaffCode: { $in: PTTStaffCode } } : {}

        var AreaName = (req) ? (req.query.AreaName && !req.query.AreaName.toString().includes('ทั้งหมด')) ? req.query.AreaName : undefined : undefined
        AreaName = (AreaName) ? { AreaName: { $in: AreaName } } : {}

        var SubAreaName = (req) ? (req.query.SubAreaName && !req.query.SubAreaName.toString().includes('ทั้งหมด')) ? req.query.SubAreaName : undefined : undefined
        SubAreaName = (SubAreaName) ? { SubAreaName: { $in: SubAreaName } } : {}

        var WPM_AreaName = (req) ? (req.query.WPM_AreaName && !req.query.WPM_AreaName.toString().includes('ทั้งหมด')) ? req.query.WPM_AreaName : undefined : undefined
        WPM_AreaName = (WPM_AreaName) ? { AreaName: { $in: WPM_AreaName } } : {}

        var WPM_SubAreaName = (req) ? (req.query.WPM_SubAreaName && !req.query.WPM_SubAreaName.toString().includes('ทั้งหมด')) ? req.query.WPM_SubAreaName : undefined : undefined
        WPM_SubAreaName = (WPM_SubAreaName) ? { SubAreaName: { $in: WPM_SubAreaName } } : {}

        var CompanyName = (req) ? (req.query.CompanyName && !req.query.CompanyName.toString().includes('ทั้งหมด')) ? req.query.CompanyName : undefined : undefined
        CompanyName = (CompanyName) ? { VendorName: { $in: CompanyName } } : {}

        //delete row
        await Scaffolding.deleteMany({
            RemoveDate: { $lte: new Date().toISOString(), $ne: "" }
        })

        await Scaffolding.find({
            // $and: [
            //     where_permission_scaffolding
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
                    filter.AreaName.push({ AreaName: element.AreaName })
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

                if (filter.WPM_AreaName.some(e => e.WPM_AreaName === element.AreaName) == false) {
                    filter.WPM_AreaName.push({ WPM_AreaName: element.AreaName })
                }

                if (req.query.WPM_AreaName) {
                    if (req.query.WPM_AreaName.toString().includes(element.AreaName) || req.query.WPM_AreaName.toString().includes('ทั้งหมด')) {
                        if (filter.WPM_SubAreaName.some(e => e.WPM_SubAreaName === element.SubAreaName) == false) {
                            filter.WPM_SubAreaName.push({
                                WPM_SubAreaName: element.SubAreaName
                            })
                        }
                    }
                } else {
                    if (filter.WPM_SubAreaName.some(e => e.WPM_SubAreaName === element.SubAreaName) == false) {
                        filter.WPM_SubAreaName.push({
                            WPM_SubAreaName: element.SubAreaName
                        })
                    }
                }


                if (filter.CompanyName.some(e => e.CompanyName === element.VendorName) == false) {
                    filter.CompanyName.push({ CompanyName: element.VendorName })
                }


            }
        })


        await Scaffolding.find({
            $and: [
                where_permission_scaffolding,
                PTTStaffCode,
                AgencyName,
                AreaName,
                SubAreaName,
                WPM_AreaName,
                WPM_SubAreaName,
                CompanyName
            ]
        }).then((result) => {
            for (let index = 0; index < result.length; index++) {
                const element = result[index]._doc;
                element.notification = {}
                element.others.data_for = 'scaffolding'
                element.others.show_in_map = true
                element.others.on_table = true

                var notification = {
                    expire: false,
                    near_expire: false,
                    no_check: false
                }
                //new



                if (element.WarningStatusID.toString() == '19') {
                    element.others.StatusName = 'expire'
                    notification.expire = true
                    expire = expire + 1

                }
                else if (element.WarningStatusID.toString() == '20') {
                    element.others.StatusName = 'near_expire'
                    notification.near_expire = true
                    near_expire = near_expire + 1
                }
                else if (element.WarningStatusID.toString() == '22') {
                    element.others.StatusName = 'no_check'
                    notification.no_check = true
                    no_check = no_check + 1

                }
                else {
                    element.others.StatusName = 'normal'
                    normal = normal + 1
                }

                element.notification.expire = notification.expire
                element.notification.near_expire = notification.near_expire
                element.notification.no_check = notification.no_check


                scaffolding_all = scaffolding_all + 1

                // var test = ''
                // if (element.ScaffoldingSubType) {
                //     test = test = element.ScaffoldingType + ' - ' + element.ScaffoldingSubType
                // } else {
                //     test = element.ScaffoldingType
                // }

                // if (ScaffoldingType.hasOwnProperty(test) == false) {
                //     ScaffoldingType[test] = 1
                // } else {
                //     ScaffoldingType[test] = ScaffoldingType[test] + 1
                // }

                delete element._id
                delete element.__v
                data_arr.push(element)
            }
        })


        var data = {}
        data.summary = {}
        data.filter = {}
        data.data = []
        if (scaffolding_amount_check.length > 0) {
            data.summary.normal = normal
            data.summary.expire = expire
            data.summary.near_expire = near_expire
            data.summary.no_check = no_check
            data.summary.all = scaffolding_all
        }
        if (scaffolding_map_check.length > 0) {
            data.data = data_arr

        }
        data.filter = filter

        var data_ = {
            Status: 'success',
            Message: data
        }
        if (check_user.others.employeeid && check_user.group_id == "62a4cb17e0a99b4456aaf51e" && Object.keys(req.query).length === 0 && data_arr.length == 0) {
            data_.MessageAlert = 'ไม่พบข้อมูลใบงานที่คุณเป็นผู้ควบคุมงาน กรุณาทำการค้นหาข้อมูลที่ต้องการ'
        }
        res.send(data_)

    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson('failed', error.toString()))
        return utilSetResponseJson('failed', error.toString())
    }

}
const people = async (req, res) => {

    try {

        var application_id = '62f762cb112721673fda40d7'
        await permission(application_id, req)


        var filter = {
            AgencyName: [{ AgencyName: "ทั้งหมด" }],
            PTTStaffCode: [{ PTTStaffCode: "ทั้งหมด", PTTStaff: "ทั้งหมด" }],
            AreaName: [{ AreaName: "ทั้งหมด" }],
            SubAreaName: [{ SubAreaName: "ทั้งหมด" }],
            WPM_AreaName: [{ WPM_AreaName: "ทั้งหมด" }],
            WPM_SubAreaName: [{ WPM_SubAreaName: "ทั้งหมด" }],
            AccDeviceName: [{ AccDeviceName: "ทั้งหมด" }],
            PeopleType: [{ PeopleType: "ทั้งหมด" }],
            VehicleType: [{ VehicleType: "ทั้งหมด" }],
            CompanyName: [{ CompanyName: "ทั้งหมด" }],
        }


        var data_arr = []
        var people_all_wpm = 0
        var people_all_gps = 0
        var where_permission_people = {}
        var PeopleType_wpm = {}
        var PeopleType_gps = {}


        var check_user = await User.findOne().where({ _id: req._id })


        //เจ้าของพื้นที่
        if (check_user.group_id == "62a4cad5e0a99b4456aaf514") {
            // if (Object.keys(req.query).length === 0) {
            //     var location1 = await People.find({ OwnerID: check_user.others.employeeid })
            //     where_permission_people = { WPM_AreaName: { $in: location1.map(el => { return el.WPM_AreaName }) } }
            // }
        }
        //ผู้ควบคุมงาน ปตท.
        else if (check_user.group_id == "62a4cb17e0a99b4456aaf51e") {
            if (Object.keys(req.query).length === 0) {
                where_permission_people = { PTTStaffID: check_user.others.employeeid }
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

        //แสดงหมุดของ people
        var people_map_check = role.filter((el) => { return el.application_id == '62f76548112721673fda41d6' })

        var people_amount_wpm_check = role.filter((el) => { return el.application_id == '63811105517cdd08ce409750' })
        var people_amount_gps_check = role.filter((el) => { return el.application_id == '6381114b517cdd08ce409751' })

        var AgencyName = (req) ? (req.query.AgencyName && !req.query.AgencyName.toString().includes('ทั้งหมด')) ? req.query.AgencyName : undefined : undefined
        AgencyName = (AgencyName) ? { AgencyName: { $in: AgencyName } } : {}

        var PTTStaffCode = (req) ? (req.query.PTTStaffCode && !req.query.PTTStaffCode.toString().includes('ทั้งหมด')) ? req.query.PTTStaffCode : undefined : undefined
        PTTStaffCode = (PTTStaffCode) ? { PTTStaffID: { $in: PTTStaffCode } } : {}

        var AreaName = (req) ? (req.query.AreaName && !req.query.AreaName.toString().includes('ทั้งหมด')) ? req.query.AreaName : undefined : undefined
        AreaName = (AreaName) ? { AreaName: { $in: AreaName } } : {}

        var SubAreaName = (req) ? (req.query.SubAreaName && !req.query.SubAreaName.toString().includes('ทั้งหมด')) ? req.query.SubAreaName : undefined : undefined
        SubAreaName = (SubAreaName) ? { SubAreaName: { $in: SubAreaName } } : {}

        var WPM_AreaName = (req) ? (req.query.WPM_AreaName && !req.query.WPM_AreaName.toString().includes('ทั้งหมด')) ? req.query.WPM_AreaName : undefined : undefined
        WPM_AreaName = (WPM_AreaName) ? { WPM_AreaName: { $in: WPM_AreaName } } : {}

        var WPM_SubAreaName = (req) ? (req.query.WPM_SubAreaName && !req.query.WPM_SubAreaName.toString().includes('ทั้งหมด')) ? req.query.SubAreaName : undefined : undefined
        WPM_SubAreaName = (WPM_SubAreaName) ? { WPM_SubAreaName: { $in: WPM_SubAreaName } } : {}

        var PeopleType = (req) ? (req.query.PeopleType && !req.query.PeopleType.toString().includes('ทั้งหมด')) ? req.query.PeopleType : undefined : undefined
        PeopleType = (PeopleType) ? { PeopleType: { $in: PeopleType } } : {}

        var CompanyName = (req) ? (req.query.CompanyName && !req.query.CompanyName.toString().includes('ทั้งหมด')) ? req.query.CompanyName : undefined : undefined
        CompanyName = (CompanyName) ? { CompanyName: { $in: CompanyName } } : {}

        await People.find({
            // $and: [
            //     where_permission_people
            // ]
        }).then((result) => {

            for (let index = 0; index < result.length; index++) {
                const element = result[index];


                if (filter.AgencyName.some(e => e.AgencyName === element.AgencyName) == false) {
                    filter.AgencyName.push({ AgencyName: element.AgencyName })
                }

                if (req.query.AgencyName) {
                    if (req.query.AgencyName.toString().includes(element.AgencyName) || req.query.AgencyName.toString().includes('ทั้งหมด')) {
                        if (filter.PTTStaffCode.some(e => e.PTTStaffCode === element.PTTStaffID) == false) {
                            filter.PTTStaffCode.push({ PTTStaffCode: element.PTTStaffID, PTTStaff: element.PTTStaffName })
                        }
                    }
                } else {
                    if (filter.PTTStaffCode.some(e => e.PTTStaffCode === element.PTTStaffID) == false) {
                        filter.PTTStaffCode.push({ PTTStaffCode: element.PTTStaffID, PTTStaff: element.PTTStaffName })
                    }
                }

                if (element.AreaName && filter.AreaName.some(e => e.AreaName === element.AreaName) == false) {
                    filter.AreaName.push({ AreaName: element.AreaName })
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

                if (element.WPM_AreaName && filter.WPM_AreaName.some(e => e.WPM_AreaName === element.WPM_AreaName) == false) {
                    filter.WPM_AreaName.push({ WPM_AreaName: element.WPM_AreaName })
                }

                if (req.query.WPM_AreaName) {
                    if (req.query.WPM_AreaName.toString().includes(element.WPM_AreaName) || req.query.WPM_AreaName.toString().includes('ทั้งหมด')) {
                        if (filter.WPM_SubAreaName.some(e => e.WPM_SubAreaName === element.WPM_SubAreaName) == false) {
                            filter.WPM_SubAreaName.push({
                                WPM_SubAreaName: element.WPM_SubAreaName
                            })
                        }
                    }
                } else {
                    if (filter.WPM_SubAreaName.some(e => e.WPM_SubAreaName === element.WPM_SubAreaName) == false) {
                        filter.WPM_SubAreaName.push({
                            WPM_SubAreaName: element.WPM_SubAreaName
                        })
                    }
                }

                if (filter.PeopleType.some(e => e.PeopleType === element.PeopleType) == false) {
                    filter.PeopleType.push({ PeopleType: element.PeopleType })
                }


                if (filter.CompanyName.some(e => e.CompanyName === element.CompanyName) == false) {
                    filter.CompanyName.push({ CompanyName: element.CompanyName })
                }
            }
        })


        await People.find({
            $and: [
                where_permission_people,
                PTTStaffCode,
                AgencyName,
                AreaName,
                SubAreaName,
                WPM_AreaName,
                WPM_SubAreaName,
                PeopleType,
                CompanyName
            ]
        }).then((result) => {
            for (let index = 0; index < result.length; index++) {
                const element = result[index]._doc;
                element.notification = {}
                element.others.data_for = 'people'
                element.others.show_in_map = true
                element.others.on_table = true

                var notification = {
                    still_or_out: false,
                    sos: false,
                    no_work: false

                }

                if (element.WarningStatusID) {
                    if (element.WarningStatusID.includes(1)) {
                        notification.still_or_out = true
                    }
                    if (element.WarningStatusID.includes(2)) {
                        notification.sos = true
                    }
                    if (element.WarningStatusID.includes(3)) {
                        notification.no_work = true
                    }
                }


                // if (still_or_out_check.length > 0) {
                element.notification.still_or_out = notification.still_or_out
                // }

                // if (sos_check.length > 0) {
                element.notification.sos = notification.sos
                // }

                // if (no_work_check.length > 0) {
                element.notification.no_work = notification.no_work
                // }

                if (!req.query.WPM_AreaName) {
                    people_all_gps = people_all_gps + 1
                    if (PeopleType_gps.hasOwnProperty(element.PeopleType) == false) {
                        PeopleType_gps[element.PeopleType] = 1
                    } else {
                        PeopleType_gps[element.PeopleType] = PeopleType_gps[element.PeopleType] + 1
                    }
                }
                if (!req.query.AreaName) {
                    people_all_wpm = people_all_wpm + 1
                    if (PeopleType_wpm.hasOwnProperty(element.PeopleType) == false) {
                        PeopleType_wpm[element.PeopleType] = 1
                    } else {
                        PeopleType_wpm[element.PeopleType] = PeopleType_wpm[element.PeopleType] + 1
                    }
                }

                delete element._id
                delete element.__v
                data_arr.push(element)
            }
        })

        var data = {}
        data.summary = {}
        data.filter = {}
        data.data = []

        if (people_amount_wpm_check.length > 0) {
            data.summary.wpm = PeopleType_wpm
            data.summary.wpm.all = people_all_wpm
        }
        if (people_amount_gps_check.length > 0) {
            data.summary.gps = PeopleType_gps
            data.summary.gps.all = people_all_gps
        }
        if (people_map_check.length > 0) {
            data.data = data_arr
        }
        data.filter = filter

        var data_ = {
            Status: 'success',
            Message: data
        }
        if (check_user.others.employeeid && check_user.group_id == "62a4cb17e0a99b4456aaf51e" && Object.keys(req.query).length === 0 && data_arr.length == 0) {
            data_.MessageAlert = 'ไม่พบข้อมูลใบงานที่คุณเป็นผู้ควบคุมงาน กรุณาทำการค้นหาข้อมูลที่ต้องการ'
        }
        res.send(data_)

    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson('failed', error.toString()))
        return utilSetResponseJson('failed', error.toString())
    }

}

const vehicle = async (req, res) => {

    try {

        var application_id = '62f762cb112721673fda40d7'
        await permission(application_id, req)

        //delete row
        await Vehicle.deleteMany({
            Remove_GPS: { $lte: new Date().toISOString().split('T')[0], $ne: "" }
        })

        var filter = {
            AgencyName: [{ AgencyName: "ทั้งหมด" }],
            PTTStaffCode: [{ PTTStaffCode: "ทั้งหมด", PTTStaff: "ทั้งหมด" }],
            AreaName: [{ AreaName: "ทั้งหมด" }],
            SubAreaName: [{ SubAreaName: "ทั้งหมด" }],
            WPM_AreaName: [{ WPM_AreaName: "ทั้งหมด" }],
            WPM_SubAreaName: [{ WPM_SubAreaName: "ทั้งหมด" }],
            AccDeviceName: [{ AccDeviceName: "ทั้งหมด" }],
            PeopleType: [{ PeopleType: "ทั้งหมด" }],
            VehicleType: [{ VehicleType: "ทั้งหมด" }],
            CompanyName: [{ CompanyName: "ทั้งหมด" }],
        }


        var In = 0
        var out = 0
        var remain = 0
        var where_permission_vehicle = {}
        var data_arr = []
        const today = moment().startOf('day')

        var check_user = await User.findOne().where({ _id: req._id })


        //เจ้าของพื้นที่
        if (check_user.group_id == "62a4cad5e0a99b4456aaf514") {
            // if (Object.keys(req.query).length === 0) {
            //     var location1 = await Vehicle.find({ OwnerCode: check_user.others.employeeid })
            //     where_permission_vehicle = { WPM_AreaName: { $in: location1.map(el => { return el.WPM_AreaName }) } }
            // }
        }
        //ผู้ควบคุมงาน ปตท.
        else if (check_user.group_id == "62a4cb17e0a99b4456aaf51e") {
            if (Object.keys(req.query).length === 0) {
                where_permission_vehicle = { PTTStaffCode: check_user.others.employeeid }
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



        //แสดงหมุดของ vehicle
        var vehicle_map_check = role.filter((el) => { return el.application_id == '63415f38ebfdbc1c9f1f7ba1' })

        //กราฟแท่งแสดงยานพาหนะ
        var vehicle_check = role.filter((el) => { return el.application_id == '62f7650b112721673fda41d0' })


        var AgencyName = (req) ? (req.query.AgencyName && !req.query.AgencyName.toString().includes('ทั้งหมด')) ? req.query.AgencyName : undefined : undefined
        AgencyName = (AgencyName) ? { AgencyName: { $in: AgencyName } } : {}

        var PTTStaffCode = (req) ? (req.query.PTTStaffCode && !req.query.PTTStaffCode.toString().includes('ทั้งหมด')) ? req.query.PTTStaffCode : undefined : undefined
        PTTStaffCode = (PTTStaffCode) ? { PTTStaffCode: { $in: PTTStaffCode } } : {}

        var AreaName = (req) ? (req.query.AreaName && !req.query.AreaName.toString().includes('ทั้งหมด')) ? req.query.AreaName : undefined : undefined
        AreaName = (AreaName) ? { AreaName: { $in: AreaName } } : {}

        var SubAreaName = (req) ? (req.query.SubAreaName && !req.query.SubAreaName.toString().includes('ทั้งหมด')) ? req.query.SubAreaName : undefined : undefined
        SubAreaName = (SubAreaName) ? { SubAreaName: { $in: SubAreaName } } : {}

        var WPM_AreaName = (req) ? (req.query.WPM_AreaName && !req.query.WPM_AreaName.toString().includes('ทั้งหมด')) ? req.query.WPM_AreaName : undefined : undefined
        WPM_AreaName = (WPM_AreaName) ? { WPM_AreaName: { $in: WPM_AreaName } } : {}

        var WPM_SubAreaName = (req) ? (req.query.WPM_SubAreaName && !req.query.WPM_SubAreaName.toString().includes('ทั้งหมด')) ? req.query.SubAreaName : undefined : undefined
        WPM_SubAreaName = (WPM_SubAreaName) ? { WPM_SubAreaName: { $in: WPM_SubAreaName } } : {}

        var VehicleType = (req) ? (req.query.VehicleType && !req.query.VehicleType.toString().includes('ทั้งหมด')) ? req.query.VehicleType : undefined : undefined
        VehicleType = (VehicleType) ? { VehicleType: { $in: VehicleType } } : {}

        var CompanyName = (req) ? (req.query.CompanyName && !req.query.CompanyName.toString().includes('ทั้งหมด')) ? req.query.CompanyName : undefined : undefined
        CompanyName = (CompanyName) ? { CompanyName: { $in: CompanyName } } : {}




        await Vehicle.find({
            // $and: [
            //     where_permission_vehicle
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
                            filter.PTTStaffCode.push({ PTTStaffCode: element.PTTStaffCode, PTTStaff: element.PTTStaffName })
                        }
                    }
                } else {
                    if (filter.PTTStaffCode.some(e => e.PTTStaffCode === element.PTTStaffCode) == false) {
                        filter.PTTStaffCode.push({ PTTStaffCode: element.PTTStaffCode, PTTStaff: element.PTTStaffName })
                    }
                }


                if (element.AreaName && filter.AreaName.some(e => e.AreaName === element.AreaName) == false) {
                    filter.AreaName.push({ AreaName: element.AreaName })
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

                if (element.WPM_AreaName && filter.WPM_AreaName.some(e => e.WPM_AreaName === element.WPM_AreaName) == false) {
                    filter.WPM_AreaName.push({ WPM_AreaName: element.WPM_AreaName })
                }

                if (req.query.WPM_AreaName) {
                    if (req.query.WPM_AreaName.toString().includes(element.WPM_AreaName) || req.query.WPM_AreaName.toString().includes('ทั้งหมด')) {
                        if (filter.WPM_SubAreaName.some(e => e.WPM_SubAreaName === element.WPM_SubAreaName) == false) {
                            filter.WPM_SubAreaName.push({
                                WPM_SubAreaName: element.WPM_SubAreaName
                            })
                        }
                    }
                } else {
                    if (filter.WPM_SubAreaName.some(e => e.WPM_SubAreaName === element.WPM_SubAreaName) == false) {
                        filter.WPM_SubAreaName.push({
                            WPM_SubAreaName: element.WPM_SubAreaName
                        })
                    }
                }

                if (filter.VehicleType.some(e => e.VehicleType === element.VehicleType) == false) {
                    filter.VehicleType.push({ VehicleType: element.VehicleType })
                }


                if (filter.CompanyName.some(e => e.CompanyName === element.CompanyName) == false) {
                    filter.CompanyName.push({ CompanyName: element.CompanyName })
                }

            }
        })

        var vehicle5 = await Vehicle5.find()

        var in_out = await Vehicle6.findOne()
        if (in_out) {
            In = parseInt(in_out.VehicleInCount)
            out = parseInt(in_out.VehicleOutCount)
        }

        await Vehicle.find({
            $and: [
                where_permission_vehicle,
                PTTStaffCode,
                AgencyName,
                AreaName,
                SubAreaName,
                WPM_AreaName,
                WPM_SubAreaName,
                VehicleType,
                CompanyName
            ]
        }).then((result) => {
            for (let index = 0; index < result.length; index++) {
                const element = result[index]._doc;
                element.notification = {}
                element.others.data_for = 'vehicle'
                element.others.show_in_map = true
                element.others.on_table = true

                var notification = {
                    drive_out_control_area: false,
                    enter_forbidden_area: false,
                    park_undefine_spot: false,
                    over_speed: false
                }

                // var join_vehicle6 = vehicle6.filter(el => { return el.VehicleID == element.VehicleID })
                // element.Vehicle6 = (join_vehicle6.length > 0) ? join_vehicle6[0] : null

                var join_vehicle5 = vehicle5.filter(el => { return el.id == element.VehicleTypeID })
                element.Vehicle5 = (join_vehicle5.length > 0) ? join_vehicle5[0] : null

                // if (element.Vehicle6) {
                //     if (element.Vehicle6.DateTime_In && (element.Vehicle6.DateTime_In >= today.toDate() && element.Vehicle6.DateTime_In <= moment(today).endOf('day').toDate())) {

                //         In = In + 1
                //     }
                //     if (element.Vehicle6.DateTime_Out && (element.Vehicle6.DateTime_Out >= today.toDate() && element.Vehicle6.DateTime_Out <= moment(today).endOf('day').toDate())) {
                //         out = out + 1

                //     }
                // }

                if (element.WarningStatusId) {
                    if (element.WarningStatusId.includes('s01')) {
                        notification.drive_out_control_area = true
                    }
                    if (element.WarningStatusId.includes('s02')) {
                        notification.park_undefine_spot = true
                    }
                    if (element.WarningStatusId.includes('s03') || element.WarningStatusId.includes('s04')) {
                        notification.over_speed = true
                    }
                    if (element.WarningStatusId.includes('s05')) {
                        notification.enter_forbidden_area = true
                    }
                }

                element.notification.drive_out_control_area = notification.drive_out_control_area
                element.notification.park_undefine_spot = notification.park_undefine_spot
                element.notification.over_speed = notification.over_speed
                element.notification.enter_forbidden_area = notification.enter_forbidden_area

                remain = remain + 1

                data_arr.push(element)
            }
        })


        var data = {}
        data.summary = {}
        data.filter = {}
        data.data = []

        if (vehicle_check.length > 0) {
            data.summary = {
                name: "ยานพาหนะ",
                total: remain,
                in: In,
                out: out
            }
        }
        if (vehicle_map_check.length > 0) {
            data.data = data_arr

        }
        data.filter = filter

        var data_ = {
            Status: 'success',
            Message: data
        }
        if (check_user.others.employeeid && check_user.group_id == "62a4cb17e0a99b4456aaf51e" && Object.keys(req.query).length === 0 && data_arr.length == 0) {
            data_.MessageAlert = 'ไม่พบข้อมูลใบงานที่คุณเป็นผู้ควบคุมงาน กรุณาทำการค้นหาข้อมูลที่ต้องการ'
        }
        res.send(data_)


    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson('failed', error.toString()))
        return utilSetResponseJson('failed', error.toString())
    }

}

const workpermit = async (req, res) => {

    try {

        var application_id = '62f762cb112721673fda40d7'
        await permission(application_id, req)


        var filter = {
            AgencyName: [{ AgencyName: "ทั้งหมด" }],
            PTTStaffCode: [{ PTTStaffCode: "ทั้งหมด", PTTStaff: "ทั้งหมด" }],
            AreaName: [{ AreaName: "ทั้งหมด" }],
            SubAreaName: [{ SubAreaName: "ทั้งหมด" }],
            WPM_AreaName: [{ WPM_AreaName: "ทั้งหมด" }],
            WPM_SubAreaName: [{ WPM_SubAreaName: "ทั้งหมด" }],
            AccDeviceName: [{ AccDeviceName: "ทั้งหมด" }],
            PeopleType: [{ PeopleType: "ทั้งหมด" }],
            VehicleType: [{ VehicleType: "ทั้งหมด" }],
            CompanyName: [{ CompanyName: "ทั้งหมด" }],
        }


        var data_arr = []
        var open = 0
        var close = 0
        var expire = 0
        var near_expire = 0
        var ONE_HOUR = 60 * 60 * 1000; /* ms */
        var where_permission_workpermit = {}

        var check_user = await User.findOne().where({ _id: req._id })


        //เจ้าของพื้นที่
        if (check_user.group_id == "62a4cad5e0a99b4456aaf514") {
            // if (Object.keys(req.query).length === 0) {
            //     var location1 = await WorkPermit.find({ approverCode: check_user.others.employeeid })
            //     where_permission_workpermit = { location: { $in: location1.map(el => { return el.location }) } }
            // }
        }
        //ผู้ควบคุมงาน ปตท.
        else if (check_user.group_id == "62a4cb17e0a99b4456aaf51e") {
            if (Object.keys(req.query).length === 0) {
                where_permission_workpermit = { supervisorCode: check_user.others.employeeid }
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

        var chek_status = await WorkpermitStatus.find()

        var role = await Role.find().where({ group_id: check_user.group_id })

        // กราฟวงกลมแสดงใบงานเปิดและปิด
        var workpermit_open_close_check = role.filter((el) => { return el.application_id == '62f76436112721673fda41ac' })

        // กราฟวงกลมแสดงสถานะใบงานหมดอายุและใกล้หมดอายุ
        var workpermit_expire_near_check = role.filter((el) => { return el.application_id == '62f7645d112721673fda41b2' })


        var AgencyName = (req) ? (req.query.AgencyName && !req.query.AgencyName.toString().includes('ทั้งหมด')) ? req.query.AgencyName : undefined : undefined
        AgencyName = (AgencyName) ? { supervisorDep: { $in: AgencyName } } : {}

        var PTTStaffCode = (req) ? (req.query.PTTStaffCode && !req.query.PTTStaffCode.toString().includes('ทั้งหมด')) ? req.query.PTTStaffCode : undefined : undefined
        PTTStaffCode = (PTTStaffCode) ? { supervisorCode: { $in: PTTStaffCode } } : {}

        var AreaName = (req) ? (req.query.AreaName && !req.query.AreaName.toString().includes('ทั้งหมด')) ? req.query.AreaName : undefined : undefined
        AreaName = (AreaName) ? { location: { $in: AreaName } } : {}

        var SubAreaName = (req) ? (req.query.SubAreaName && !req.query.SubAreaName.toString().includes('ทั้งหมด')) ? req.query.SubAreaName : undefined : undefined
        SubAreaName = (SubAreaName) ? { subLocation: { $in: SubAreaName } } : {}

        var CompanyName = (req) ? (req.query.CompanyName && !req.query.CompanyName.toString().includes('ทั้งหมด')) ? req.query.CompanyName : undefined : undefined
        CompanyName = (CompanyName) ? { companyName: { $in: CompanyName } } : {}

        await WorkPermit.find({
            // $and: [
            //     where_permission_workpermit
            // ]
        }).then((result) => {
            for (let index = 0; index < result.length; index++) {
                const element = result[index]._doc;

                if (filter.AgencyName.some(e => e.AgencyName === element.supervisorDep) == false) {
                    filter.AgencyName.push({ AgencyName: element.supervisorDep })
                }

                if (req.query.AgencyName) {
                    if (req.query.AgencyName.toString().includes(element.supervisorDep) || req.query.AgencyName.toString().includes('ทั้งหมด')) {
                        if (filter.PTTStaffCode.some(e => e.PTTStaffCode === element.supervisorCode) == false) {
                            filter.PTTStaffCode.push({ PTTStaffCode: element.supervisorCode, PTTStaff: element.supervisorFName + ' ' + element.supervisorLName })
                        }
                    }
                } else {
                    if (filter.PTTStaffCode.some(e => e.PTTStaffCode === element.supervisorCode) == false) {
                        filter.PTTStaffCode.push({ PTTStaffCode: element.supervisorCode, PTTStaff: element.supervisorFName + ' ' + element.supervisorLName })
                    }
                }

                if (filter.AreaName.some(e => e.AreaName === element.location) == false) {
                    filter.AreaName.push({ AreaName: element.location })

                }

                if (req.query.AreaName) {
                    if (req.query.AreaName.toString().includes(element.location) || req.query.AreaName.toString().includes('ทั้งหมด')) {
                        if (filter.SubAreaName.some(e => e.SubAreaName === element.subLocation) == false) {
                            filter.SubAreaName.push({
                                SubAreaName: element.subLocation
                            })
                        }
                    }
                } else {
                    if (filter.SubAreaName.some(e => e.SubAreaName === element.subLocation) == false) {
                        filter.SubAreaName.push({
                            SubAreaName: element.subLocation
                        })
                    }
                }


                if (filter.CompanyName.some(e => e.CompanyName === element.companyName) == false) {
                    filter.CompanyName.push({ CompanyName: element.companyName })
                }


            }

        })

        if (workpermit_expire_near_check.length > 0 || workpermit_open_close_check.length > 0) {
            await WorkPermit.find({
                $and: [
                    where_permission_workpermit,
                    PTTStaffCode,
                    AgencyName,
                    AreaName,
                    SubAreaName,
                    CompanyName
                ]
            }).then(result => {
                for (let index = 0; index < result.length; index++) {
                    const element = result[index]._doc;

                    if (workpermit_open_close_check.length > 0) {
                        var check = chek_status.filter(function (el) {
                            return el.Status_ID == element.workpermitStatusId
                        });

                        if (check.length > 0 && check[0].IsOpen == true) {
                            open = open + 1
                        } else {
                            close = close + 1
                        }
                    }

                    if (workpermit_expire_near_check.length > 0) {
                        if (element.others.workingEnd) {
                            var workingEnd = element.others.workingEnd
                            if (workingEnd - new Date() < ONE_HOUR && workingEnd >= new Date()) {
                                near_expire = near_expire + 1
                            }

                            if (workingEnd < new Date()) {
                                expire = expire + 1
                            }
                        }

                    }
                }
            })

        }

        var data = {}
        data.summary = {}

        if (workpermit_open_close_check.length > 0) {
            data.summary.workpermit = {
                open: open,
                close: close,
                all: open + close
            }
        }

        if (workpermit_expire_near_check.length > 0) {
            data.summary.workpermit_status = {
                expire: expire,
                near_expire: near_expire,
                all: expire + near_expire
            }
        }
        data.filter = filter
        data.data = data_arr

        if (res)
            return res.send(utilSetResponseJson('success', data))
        return utilSetResponseJson('success', data)
    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson('failed', error.toString()))
        return utilSetResponseJson('failed', error.toString())
    }

}

const equipment = async (req, res) => {

    try {

        var application_id = '62f762cb112721673fda40d7'
        await permission(application_id, req)


        await EquipmentVehicle.deleteMany({
            Remove_Obstruction: { $lte: new Date() }
        })

        await Equipment.deleteMany({
            DateTime_Out: { $lte: new Date() }
        })

        var filter = {
            AgencyName: [{ AgencyName: "ทั้งหมด" }],
            PTTStaffCode: [{ PTTStaffCode: "ทั้งหมด", PTTStaff: "ทั้งหมด" }],
            AreaName: [{ AreaName: "ทั้งหมด" }],
            SubAreaName: [{ SubAreaName: "ทั้งหมด" }],
            WPM_AreaName: [{ WPM_AreaName: "ทั้งหมด" }],
            WPM_SubAreaName: [{ WPM_SubAreaName: "ทั้งหมด" }],
            AccDeviceName: [{ AccDeviceName: "ทั้งหมด" }],
            PeopleType: [{ PeopleType: "ทั้งหมด" }],
            VehicleType: [{ VehicleType: "ทั้งหมด" }],
            CompanyName: [{ CompanyName: "ทั้งหมด" }],
        }

        var data_arr = []
        var all = 0
        var risk_equipment = 0
        var where_permission_equipment = {}
        var check_user = await User.findOne().where({ _id: req._id })


        //เจ้าของพื้นที่
        if (check_user.group_id == "62a4cad5e0a99b4456aaf514") {
            //where_permission_equipment check in for loop
        }
        //ผู้ควบคุมงาน ปตท.
        else if (check_user.group_id == "62a4cb17e0a99b4456aaf51e") {
            if (Object.keys(req.query).length === 0) {
                where_permission_equipment.PTTStaffCode = check_user.others.employeeid
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

        //กราฟวงกลมแสดงจำนวนอุปกรณ์ทั่วไปและอุปกรณ์เสี่ยง
        var equipment_risk_check = role.filter((el) => { return el.application_id == '62f764c6112721673fda41be' })


        var AgencyName = (req) ? (req.query.AgencyName && !req.query.AgencyName.toString().includes('ทั้งหมด')) ? req.query.AgencyName : undefined : undefined
        AgencyName = (AgencyName) ? { AgencyName: { $in: AgencyName } } : {}

        var PTTStaffCode = (req) ? (req.query.PTTStaffCode && !req.query.PTTStaffCode.toString().includes('ทั้งหมด')) ? req.query.PTTStaffCode : undefined : undefined
        PTTStaffCode = (PTTStaffCode) ? { PTTStaffCode: { $in: PTTStaffCode } } : {}

        var AreaName = (req) ? (req.query.AreaName && !req.query.AreaName.toString().includes('ทั้งหมด')) ? req.query.AreaName : undefined : undefined
        AreaName = (AreaName) ? { AreaName: { $in: AreaName } } : {}

        var CompanyName = (req) ? (req.query.CompanyName && !req.query.CompanyName.toString().includes('ทั้งหมด')) ? req.query.CompanyName : undefined : undefined
        CompanyName = (CompanyName) ? { CompanyName: { $in: CompanyName } } : {}

        await Equipment.find({
            // $and: [
            //     where_permission_equipment
            // ]
        }).then((result) => {
            for (let index = 0; index < result.length; index++) {
                const element = result[index];

                // if (check_user.group_id == "62a4cad5e0a99b4456aaf514") {
                //     if (element.OwnerCode_3) {
                //         if (check_user.others.employeeid != element.OwnerCode_3) {
                //             continue
                //         }
                //     } else if (element.OwnerCode_2) {
                //         if (check_user.others.employeeid != element.OwnerCode_2) {
                //             continue
                //         }
                //     } else {
                //         if (check_user.others.employeeid != element.OwnerCode_1) {
                //             continue
                //         }
                //     }
                // }


                if (filter.AgencyName.some(e => e.AgencyName === element.AgencyName) == false) {
                    filter.AgencyName.push({ AgencyName: element.AgencyName })
                }

                if (req.query.AgencyName) {
                    if (req.query.AgencyName.toString().includes(element.AgencyName) || req.query.AgencyName.toString().includes('ทั้งหมด')) {
                        if (filter.PTTStaffCode.some(e => e.PTTStaffCode === element.PTTStaffCode) == false) {
                            filter.PTTStaffCode.push({ PTTStaffCode: element.PTTStaffCode, PTTStaff: element.PTTStaffName })
                        }
                    }
                } else {
                    if (filter.PTTStaffCode.some(e => e.PTTStaffCode === element.PTTStaffCode) == false) {
                        filter.PTTStaffCode.push({ PTTStaffCode: element.PTTStaffCode, PTTStaff: element.PTTStaffName })
                    }
                }

                if (filter.AreaName.some(e => e.AreaName === element.AreaName) == false) {
                    filter.AreaName.push({ AreaName: element.AreaName })
                }


                if (filter.CompanyName.some(e => e.CompanyName === element.CompanyName) == false) {
                    filter.CompanyName.push({ CompanyName: element.CompanyName })
                }

            }
        })

        if (equipment_risk_check.length > 0) {

            await Equipment.find({
                $and: [
                    where_permission_equipment,
                    PTTStaffCode,
                    AgencyName,
                    AreaName,
                    CompanyName
                ]
            }).then((result) => {

                for (let index = 0; index < result.length; index++) {
                    const element = result[index]._doc;

                    // if (check_user.group_id == "62a4cad5e0a99b4456aaf514") {
                    //     if (element.OwnerCode_3) {
                    //         if (check_user.others.employeeid != element.OwnerCode_3) {
                    //             continue
                    //         }
                    //     } else if (element.OwnerCode_2) {
                    //         if (check_user.others.employeeid != element.OwnerCode_2) {
                    //             continue
                    //         }
                    //     } else {
                    //         if (check_user.others.employeeid != element.OwnerCode_1) {
                    //             continue
                    //         }
                    //     }
                    // }

                    if (element.DateTime_Out) {
                        if (element.DateTime_Out < new Date) {
                        } else {
                            all = all + 1
                        }
                    } else {
                        if (element.risk_equipment == 1) {
                            risk_equipment = risk_equipment + 1
                        }
                        all = all + 1
                    }

                }
            })
        }

        var data = {}
        data.summary = {}
        if (equipment_risk_check.length > 0) {
            data.summary = {
                equipment: all - risk_equipment,
                risk_equipment: risk_equipment,
                all: all
            }
        }

        data.filter = filter
        data.data = data_arr

        if (res)
            return res.send(utilSetResponseJson('success', data))
        return utilSetResponseJson('success', data)
    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson('failed', error.toString()))
        return utilSetResponseJson('failed', error.toString())
    }

}
const accesscontrol = async (req, res) => {

    try {

        var application_id = '62f762cb112721673fda40d7'
        await permission(application_id, req)

        var filter = {
            AgencyName: [{ AgencyName: "ทั้งหมด" }],
            PTTStaffCode: [{ PTTStaffCode: "ทั้งหมด", PTTStaff: "ทั้งหมด" }],
            AreaName: [{ AreaName: "ทั้งหมด" }],
            SubAreaName: [{ SubAreaName: "ทั้งหมด" }],
            WPM_AreaName: [{ WPM_AreaName: "ทั้งหมด" }],
            WPM_SubAreaName: [{ WPM_SubAreaName: "ทั้งหมด" }],
            AccDeviceName: [{ AccDeviceName: "ทั้งหมด" }],
            PeopleType: [{ PeopleType: "ทั้งหมด" }],
            VehicleType: [{ VehicleType: "ทั้งหมด" }],
            CompanyName: [{ CompanyName: "ทั้งหมด" }],
        }

        var data_arr = []
        var online = 0
        var offline = 0

        // var where_permission_accesscontrol = {}

        var check_user = await User.findOne().where({ _id: req._id })


        //เจ้าของพื้นที่
        if (check_user.group_id == "62a4cad5e0a99b4456aaf514") {
            // if (Object.keys(req.query).length === 0) {
            //     var location1 = await WorkPermit.find({ approverCode: check_user.others.employeeid })
            //     var test = await WorkPermit.find({ location: { $in: location1.map(el => { return el.location }) } })
            //     where_permission_accesscontrol = { WorkPermitID: { $in: test.map(el => { return el.workPermitID }) } }
            // }

        }
        //ผู้ควบคุมงาน ปตท.
        else if (check_user.group_id == "62a4cb17e0a99b4456aaf51e") {
            // if (Object.keys(req.query).length === 0) {
            //     where_permission_accesscontrol = { PTTStaffCode: check_user.others.employeeid }
            // }

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


        //แสดงหมุดของ access control
        var access_control_map_check = role.filter((el) => { return el.application_id == '62f7656c112721673fda41e2' })

        //กราฟวงกลมแสดงสถานะ access control ออฟไลน์และออนไลน์
        var access_control_online_off_chcek = role.filter((el) => { return el.application_id == '62f76493112721673fda41b8' })

        var AccDeviceName = (req) ? (req.query.AccDeviceName && !req.query.AccDeviceName.toString().includes('ทั้งหมด')) ? req.query.AccDeviceName : undefined : undefined
        AccDeviceName = (AccDeviceName) ? { AccDeviceName: AccDeviceName } : {}

        var AreaName = (req) ? (req.query.AreaName && !req.query.AreaName.toString().includes('ทั้งหมด')) ? req.query.AreaName : undefined : undefined
        AreaName = (AreaName) ? { AreaName: { $in: AreaName } } : {}

        var SubAreaName = (req) ? (req.query.SubAreaName && !req.query.SubAreaName.toString().includes('ทั้งหมด')) ? req.query.SubAreaName : undefined : undefined
        SubAreaName = (SubAreaName) ? { SubAreaName: { $in: SubAreaName } } : {}

        var WPM_AreaName = (req) ? (req.query.WPM_AreaName && !req.query.WPM_AreaName.toString().includes('ทั้งหมด')) ? req.query.WPM_AreaName : undefined : undefined
        WPM_AreaName = (WPM_AreaName) ? { AreaName: { $in: WPM_AreaName } } : {}

        var WPM_SubAreaName = (req) ? (req.query.WPM_SubAreaName && !req.query.WPM_SubAreaName.toString().includes('ทั้งหมด')) ? req.query.WPM_SubAreaName : undefined : undefined
        WPM_SubAreaName = (WPM_SubAreaName) ? { SubAreaName: { $in: WPM_SubAreaName } } : {}

        var AccDeviceName_master = await AccessControlDevice.find({

        }).then((result) => {
            for (let index = 0; index < result.length; index++) {
                const element = result[index]._doc;

                if (filter.AreaName.some(e => e.AreaName === element.AreaName) == false) {
                    filter.AreaName.push({ AreaName: element.AreaName })
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

                if (filter.WPM_AreaName.some(e => e.WPM_AreaName === element.AreaName) == false) {
                    filter.WPM_AreaName.push({ WPM_AreaName: element.AreaName })
                }

                if (req.query.WPM_AreaName) {
                    if (req.query.WPM_AreaName.toString().includes(element.AreaName) || req.query.WPM_AreaName.toString().includes('ทั้งหมด')) {
                        if (filter.WPM_SubAreaName.some(e => e.WPM_SubAreaName === element.SubAreaName) == false) {
                            filter.WPM_SubAreaName.push({
                                WPM_SubAreaName: element.SubAreaName
                            })
                        }
                    }
                } else {
                    if (filter.WPM_SubAreaName.some(e => e.WPM_SubAreaName === element.SubAreaName) == false) {
                        filter.WPM_SubAreaName.push({
                            WPM_SubAreaName: element.SubAreaName
                        })
                    }
                }

                if (filter.AccDeviceName.some(e => e.AccDeviceName === element.AccDeviceName) == false) {
                    filter.AccDeviceName.push({ AccDeviceName: element.AccDeviceName })
                }

            }
        })

        //แสดงหมุดของ access control
        await AccessControlDevice.find({
            $and: [
                AccDeviceName,
                AreaName,
                SubAreaName,
                WPM_AreaName,
                WPM_SubAreaName
            ]
        }).then(result => {

            for (let index = 0; index < result.length; index++) {
                const element = result[index]._doc;

                element.notification = {}

                element.others.data_for = 'accesscontrol'
                element.others.show_in_map = true
                element.others.on_table = false


                var notification = {
                    offline: false
                }

                if (element.AccDeviceStatus == '0') {
                    offline = offline + 1
                    element.others.AccDeviceStatus = 'offline'
                    notification.offline = true

                } else if (element.AccDeviceStatus == '1') {
                    online = online + 1
                    element.others.AccDeviceStatus = 'online'
                }

                element.notification.offline = notification.offline

                data_arr.push(element)

            }
        })


        var data = {}
        data.summary = {}
        data.filter = {}
        data.data = []
        if (access_control_online_off_chcek.length > 0) {
            data.summary = {
                online: online,
                offline: offline,
                all: online + offline
            }
        }
        if (access_control_map_check.length > 0) {
            data.data = data_arr

        }
        data.filter = filter

        if (res)
            return res.send(utilSetResponseJson('success', data))
        return utilSetResponseJson('success', data)
    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson('failed', error.toString()))
        return utilSetResponseJson('failed', error.toString())
    }

}





export { scaffolding, people, workpermit, equipment, vehicle, accesscontrol };
