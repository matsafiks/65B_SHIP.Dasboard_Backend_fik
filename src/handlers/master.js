
import utilSetResponseJson from '../utils/util.SetResponseJson.js';
import Scaffolding from "../models/Scaffolding/Scaffolding.js";
import Location from "../models/Master/Location/Location.js";
import modelScaffoldingType from "../models/Master/ScaffoldingType/ScaffoldingType.js";
import _ from 'lodash'
import User from '../models/User/User.js';
import { permission } from '../preHandlers/permission.js';
import Role from '../models/Role/Role.js';
import socket_io from "../utils/socket_io.js";
import WorkPermit from '../models/WorkPermit/WorkPermit.js';
import Vehicle from '../models/Vehicle/Vehicle.js';
import AccessControl from '../models/AccessControl/AccessControl.js';
import People from '../models/People/People.js';
import Equipment from '../models/Equipment/Equipment.js';
import AccessControlDevice from '../models/AccessControlDevice/AccessControlDevice.js';

const pttstaffcodeAll = async (req, res) => {

    try {


        // var application_id = '62a4d4c622bdf92ba30d1633'
        // await permission(application_id, req)


        var pttstaffcodeAll = []

        var AgencyName = (req) ? (req.query.AgencyName && !req.query.AgencyName.toString().includes('ทั้งหมด')) ? req.query.AgencyName : undefined : undefined
        AgencyName = (AgencyName) ? { AgencyName: { $in: AgencyName } } : {}

        var AgencyName_workpermit = (req) ? (req.query.AgencyName && !req.query.AgencyName.toString().includes('ทั้งหมด')) ? req.query.AgencyName : undefined : undefined
        AgencyName_workpermit = (AgencyName_workpermit) ? { supervisorDep: { $in: AgencyName_workpermit } } : {}


        var which = (req) ? (req.query.which && req.query.which.toString() != 'ทั้งหมด') ? req.query.which : undefined : undefined
        // which = (which) ? { which: { $in: AgencyName } } : 

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
                where_permission_workpermit = { PTTStaffCode: check_user.others.employeeid }
                where_permission_scaffolding = { PTTStaffCode: check_user.others.employeeid }
                where_permission_accesscontrol = { PTTStaffCode: check_user.others.employeeid }
                where_permission_people = { PTTStaffCode: check_user.others.employeeid }
                where_permission_vehicle = { PTTStaffCode: check_user.others.employeeid }
                where_permission_equipment = { PTTStaffCode: check_user.others.employeeid }
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

        if (!which || which == 'workpermit') {
            await WorkPermit.find({
                $and: [AgencyName_workpermit]
            }).then(res => {
                for (let index = 0; index < res.length; index++) {
                    const element = res[index];

                    if (pttstaffcodeAll.some(e => e.PTTStaffCode === element.supervisorCode) == false) {
                        pttstaffcodeAll.push({ PTTStaffCode: element.supervisorCode, PTTStaff: element.supervisorFName + ' ' + element.supervisorLName })
                    }

                }
            })
        }

        if (!which || which == 'scaffolding') {
            await Scaffolding.find({
                $and: [AgencyName]
            }).then(res => {
                for (let index = 0; index < res.length; index++) {
                    const element = res[index];

                    if (pttstaffcodeAll.some(e => e.PTTStaffCode === element.PTTStaffCode) == false) {
                        pttstaffcodeAll.push({ PTTStaffCode: element.PTTStaffCode, PTTStaff: element.PTTStaff })
                    }
                }
            })

        }

        if (!which || which == 'vehicle') {
            await Vehicle.find({
                $and: [AgencyName]
            }).then(res => {
                for (let index = 0; index < res.length; index++) {
                    const element = res[index];

                    if (pttstaffcodeAll.some(e => e.PTTStaffCode === element.PTTStaffCode) == false) {
                        pttstaffcodeAll.push({ PTTStaffCode: element.PTTStaffCode, PTTStaff: element.PTTStaffName })
                    }
                }
            })
        }

        if (!which || which == 'people') {
            await People.find({
                $and: [AgencyName]
            }).then(res => {
                for (let index = 0; index < res.length; index++) {
                    const element = res[index];

                    if (pttstaffcodeAll.some(e => e.PTTStaffCode === element.PTTStaffID) == false) {
                        pttstaffcodeAll.push({ PTTStaffCode: element.PTTStaffID, PTTStaff: element.PTTStaffName })
                    }
                }
            })
        }

        if (!which || which == 'equipment') {
            await Equipment.find({
                $and: [AgencyName]
            }).then(res => {
                for (let index = 0; index < res.length; index++) {
                    const element = res[index];

                    if (pttstaffcodeAll.some(e => e.PTTStaffCode === element.PTTStaffCode) == false) {
                        pttstaffcodeAll.push({ PTTStaffCode: element.PTTStaffCode, PTTStaff: element.PTTStaffName })
                    }
                }
            })
        }


        if (!which || which == 'accesscontrol') {
            await AccessControl.find({
                $and: [AgencyName]
            }).then(res => {
                for (let index = 0; index < res.length; index++) {
                    const element = res[index];

                    if (pttstaffcodeAll.some(e => e.PTTStaffCode === element.PTTStaffCode) == false) {
                        pttstaffcodeAll.push({ PTTStaffCode: element.PTTStaffCode, PTTStaff: element.PTTStaffFirstName + ' ' + element.PTTStaffLastName })
                    }
                }
            })
        }


        if (res)
            return res.send(utilSetResponseJson('success', pttstaffcodeAll))
        return utilSetResponseJson('success', data)
    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson('failed', error.toString()))
        return utilSetResponseJson('failed', error.toString())
    }
}
const subareaAll = async (req, res) => {

    try {


        // var application_id = '62a4d4c622bdf92ba30d1633'
        // await permission(application_id, req)


        var subareaAll = []

        var AreaName = (req) ? (req.query.AreaName && !req.query.AreaName.toString().includes('ทั้งหมด')) ? req.query.AreaName : undefined : undefined
        AreaName = (AreaName) ? { AreaName: { $in: AreaName } } : {}

        var which = (req) ? (req.query.which && req.query.which.toString() != 'ทั้งหมด') ? req.query.which : undefined : undefined
        // which = (which) ? { which: { $in: AreaName } } : 



        if (!which || which == 'vehicle') {
            await Vehicle.find({
                $and: [AreaName]
            }).then(res => {
                for (let index = 0; index < res.length; index++) {
                    const element = res[index];

                    if (subareaAll.some(e => e.SubAreaName === element.SubAreaName) == false) {
                        subareaAll.push({ SubAreaName: element.SubAreaName })
                    }
                }
            })
        }

        if (!which || which == 'people') {
            await People.find({
                $and: [AreaName]
            }).then(res => {
                for (let index = 0; index < res.length; index++) {
                    const element = res[index];

                    if (subareaAll.some(e => e.SubAreaName === element.SubAreaName) == false) {
                        subareaAll.push({ SubAreaName: element.SubAreaName })
                    }
                }
            })
        }




        if (res)
            return res.send(utilSetResponseJson('success', subareaAll))
        return utilSetResponseJson('success', data)
    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson('failed', error.toString()))
        return utilSetResponseJson('failed', error.toString())
    }
}
const wpmSubareaAll = async (req, res) => {

    try {


        // var application_id = '62a4d4c622bdf92ba30d1633'
        // await permission(application_id, req)


        var wpmSubareaAll = []

        var AreaName = (req) ? (req.query.WPM_AreaName && !req.query.WPM_AreaName.toString().includes('ทั้งหมด')) ? req.query.WPM_AreaName : undefined : undefined
        AreaName = (AreaName) ? { AreaName: { $in: AreaName } } : {}

        var AreaName_workpermit = (req) ? (req.query.WPM_AreaName && !req.query.WPM_AreaName.toString().includes('ทั้งหมด')) ? req.query.WPM_AreaName : undefined : undefined
        AreaName_workpermit = (AreaName_workpermit) ? { location: { $in: AreaName_workpermit } } : {}

        var WPM_AreaName = (req) ? (req.query.WPM_AreaName && !req.query.WPM_AreaName.toString().includes('ทั้งหมด')) ? req.query.WPM_AreaName : undefined : undefined
        WPM_AreaName = (WPM_AreaName) ? { WPM_AreaName: { $in: WPM_AreaName } } : {}


        var which = (req) ? (req.query.which && req.query.which.toString() != 'ทั้งหมด') ? req.query.which : undefined : undefined
        // which = (which) ? { which: { $in: WPM_AreaName } } : 


        if (!which || which == 'workpermit') {
            await WorkPermit.find({
                $and: [AreaName_workpermit]
            }).then(res => {
                for (let index = 0; index < res.length; index++) {
                    const element = res[index];

                    if (wpmSubareaAll.some(e => e.WPM_SubAreaName === element.subLocation) == false) {
                        wpmSubareaAll.push({ WPM_SubAreaName: element.subLocation })
                    }

                }
            })
        }

        if (!which || which == 'scaffolding') {
            await Scaffolding.find({
                $and: [AreaName]
            }).then(res => {
                for (let index = 0; index < res.length; index++) {
                    const element = res[index];

                    if (wpmSubareaAll.some(e => e.WPM_SubAreaName === element.SubAreaName) == false) {
                        wpmSubareaAll.push({ WPM_SubAreaName: element.SubAreaName })
                    }
                }
            })

        }


        if (!which || which == 'vehicle') {
            await Vehicle.find({
                $and: [WPM_AreaName]
            }).then(res => {
                for (let index = 0; index < res.length; index++) {
                    const element = res[index];

                    if (wpmSubareaAll.some(e => e.WPM_SubAreaName === element.WPM_SubAreaName) == false && element.WPM_SubAreaName) {
                        wpmSubareaAll.push({ WPM_SubAreaName: element.WPM_SubAreaName })
                    }
                }
            })
        }

        if (!which || which == 'people') {
            await People.find({
                $and: [WPM_AreaName]
            }).then(res => {
                for (let index = 0; index < res.length; index++) {
                    const element = res[index];

                    if (wpmSubareaAll.some(e => e.WPM_SubAreaName === element.WPM_SubAreaName) == false && element.WPM_SubAreaName) {
                        wpmSubareaAll.push({ WPM_SubAreaName: element.WPM_SubAreaName })
                    }
                }
            })
        }


        if (!which || which == 'accesscontrol') {
            var AccDeviceName_master = await AccessControlDevice.find({})
            await AccessControl.find({
                $and: [AreaName]
            }).then(res => {
                for (let index = 0; index < res.length; index++) {
                    const element = res[index];

                    var join_access_control_device = AccDeviceName_master.filter(el => { return el.AccDeviceID == element.ACC_ID })
                    if (join_access_control_device.length > 0) {
                        element.SubAreaName = join_access_control_device[0].SubAreaName
                        if (wpmSubareaAll.some(e => e.WPM_SubAreaName === element.SubAreaName) == false) {
                            wpmSubareaAll.push({ WPM_SubAreaName: element.SubAreaName })
                        }
                    }
                }
            })
        }




        if (res)
            return res.send(utilSetResponseJson('success', wpmSubareaAll))
        return utilSetResponseJson('success', data)
    } catch (error) {
        if (res)
            return res.send(utilSetResponseJson('failed', error.toString()))
        return utilSetResponseJson('failed', error.toString())
    }
}


export { pttstaffcodeAll, subareaAll, wpmSubareaAll };
