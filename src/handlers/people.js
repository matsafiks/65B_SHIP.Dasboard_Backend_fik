
import utilSetResponseJson from '../utils/util.SetResponseJson.js';
import People from "../models/People/People.js";
import Location from "../models/Master/Location/Location.js";
// import modelScaffoldingType from "../models/Master/PeopleType/PeopleType.js";
import _ from 'lodash'
import User from '../models/User/User.js';
import { permission } from '../preHandlers/permission.js';
import Role from '../models/Role/Role.js';
import PeopleRestrict from '../models/PeopleRestrict/PeopleRestrict.js';

const all = async (req, res) => {

    try {

        var application_id = '62a4d4de22bdf92ba30d1637'
        await permission(application_id, req)


        var filter = {
            AgencyName: [{ AgencyName: 'ทั้งหมด' }],
            PTTStaffID: [{ PTTStaffID: 'ทั้งหมด', PTTStaff: 'ทั้งหมด' }],
            AreaName: [{ AreaName: 'ทั้งหมด' }],
            SubAreaName: [{ SubAreaName: 'ทั้งหมด' }],
            WPM_AreaName: [{ WPM_AreaName: 'ทั้งหมด' }],
            WPM_SubAreaName: [{ WPM_SubAreaName: 'ทั้งหมด' }],
            PeopleType: [{ PeopleType: 'ทั้งหมด' }],
            CompanyName: [{ CompanyName: 'ทั้งหมด' }],
            notification: [{ notification: 'ทั้งหมด' }],
        }
        var where_permission = {}
        var all = 0
        var sos = 0
        var still_or_out = 0
        var no_work = 0
        var data_arr = []


        var AgencyName = (req) ? (req.query.AgencyName && !req.query.AgencyName.toString().includes('ทั้งหมด')) ? req.query.AgencyName : undefined : undefined
        AgencyName = (AgencyName) ? { AgencyName: { $in: AgencyName } } : {}

        var PTTStaffID = (req) ? (req.query.PTTStaffID && !req.query.PTTStaffID.toString().includes('ทั้งหมด')) ? req.query.PTTStaffID : undefined : undefined
        PTTStaffID = (PTTStaffID) ? { PTTStaffID: { $in: PTTStaffID } } : {}

        var WorkingStartDate = (req) ? req.query.WorkingStartDate : undefined
        WorkingStartDate = (WorkingStartDate) ? { 'others.WorkingStart': { $gte: WorkingStartDate } } : {}

        var WorkingEndDate = (req) ? req.query.WorkingEndDate : undefined
        WorkingEndDate = (WorkingEndDate) ? { 'others.WorkingEnd': { $lte: WorkingEndDate } } : {}

        var AreaName = (req) ? (req.query.AreaName && !req.query.AreaName.toString().includes('ทั้งหมด')) ? req.query.AreaName : undefined : undefined
        AreaName = (AreaName) ? { AreaName: { $in: AreaName } } : {}

        var SubAreaName = (req) ? (req.query.SubAreaName && !req.query.SubAreaName.toString().includes('ทั้งหมด')) ? req.query.SubAreaName : undefined : undefined
        SubAreaName = (SubAreaName) ? { SubAreaName: { $in: SubAreaName } } : {}

        var WPM_AreaName = (req) ? (req.query.WPM_AreaName && !req.query.WPM_AreaName.toString().includes('ทั้งหมด')) ? req.query.WPM_AreaName : undefined : undefined
        WPM_AreaName = (WPM_AreaName) ? { WPM_AreaName: { $in: WPM_AreaName } } : {}

        var WPM_SubAreaName = (req) ? (req.query.WPM_SubAreaName && !req.query.WPM_SubAreaName.toString().includes('ทั้งหมด')) ? req.query.WPM_SubAreaName : undefined : undefined
        WPM_SubAreaName = (WPM_SubAreaName) ? { WPM_SubAreaName: { $in: WPM_SubAreaName } } : {}

        var PeopleType = (req) ? (req.query.PeopleType && !req.query.PeopleType.toString().includes('ทั้งหมด')) ? req.query.PeopleType : undefined : undefined
        PeopleType = (PeopleType) ? { PeopleType: { $in: PeopleType } } : {}

        var CompanyName = (req) ? (req.query.CompanyName && !req.query.CompanyName.toString().includes('ทั้งหมด')) ? req.query.CompanyName : undefined : undefined
        CompanyName = (CompanyName) ? { CompanyName: { $in: CompanyName } } : {}

        var Notification = (req) ? (req.query.notification && !req.query.notification.toString().includes('ทั้งหมด')) ? req.query.notification : [] : []


        var check_user = await User.findOne().where({ _id: req._id })

        var now = new Date
        var day_7 = new Date().setDate(new Date().getDate() + 7);

        //เจ้าของพื้นที่
        if (check_user.group_id == "62a4cad5e0a99b4456aaf514") {

            // if (Object.keys(req.query).length === 0) {
            //     var location1 = await People.find({ OwnerID: check_user.others.employeeid })
            //     where_permission = { WPM_AreaName: { $in: location1.map(el => { return el.WPM_AreaName }) } }
            // }

        }
        //ผู้ควบคุมงาน ปตท.
        else if (check_user.group_id == "62a4cb17e0a99b4456aaf51e") {
            if (Object.keys(req.query).length === 0) {
                where_permission = { PTTStaffID: check_user.others.employeeid }
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


        // แสดงภาพรวมบุคคลที่ปฏิบัติงาน โดยมี Icon แสดงแยกตามประเภทกลุ่มบุคคล ได้แก่ ผู้รับเหมา, เจ้าหน้าที่ความปลอดภัย, ผู้เฝ้าระวังไฟ เป็นต้น
        var over_all_check = role.filter((el) => { return el.application_id == '630cf4add911b53955bbc08b' })

        // การแจ้งเตือนอยู่นิ่งหรืออยู่นอกพื้นที่
        var still_or_out_check = role.filter((el) => { return el.application_id == '630cf62cd911b53955bbc091' })

        //การแจ้งเตือน sos"
        var sos_check = role.filter((el) => { return el.application_id == '630cf671d911b53955bbc097' })

        //การแจ้งเตือนไม่มีงาน"
        var no_work_check = role.filter((el) => { return el.application_id == '630cf6b0d911b53955bbc09d' })

        //ใช้ฟังก์ชันการค้นหาข้อมูล โดยเมนู Search สามารถทำการเปิด-ปิด หน้าต่างการค้นหาได้ เพื่อเพิ่มพื้นที่การแสดงผลของ Dashboard
        var search_check = role.filter((el) => { return el.application_id == '630cf6d2d911b53955bbc0a3' })


        var AreaName_master = await Location.find()
        // var ScaffoldingType_master = await modelScaffoldingType.find()


        await People.find({
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
                        if (filter.PTTStaffID.some(e => e.PTTStaffID === element.PTTStaffID) == false) {
                            filter.PTTStaffID.push({ PTTStaffID: element.PTTStaffID, PTTStaff: element.PTTStaffName })
                        }
                    }
                } else {
                    if (filter.PTTStaffID.some(e => e.PTTStaffID === element.PTTStaffID) == false) {
                        filter.PTTStaffID.push({ PTTStaffID: element.PTTStaffID, PTTStaff: element.PTTStaffName })
                    }
                }

                if (element.AreaName && filter.AreaName.some(e => e.AreaName === element.AreaName) == false) {
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

                if (element.WPM_AreaName && filter.WPM_AreaName.some(e => e.WPM_AreaName === element.WPM_AreaName) == false) {
                    filter.WPM_AreaName.push({
                        ...(AreaName_master.filter(el => { return el.Location_Name == element.WPM_AreaName })[0]) ?
                            AreaName_master.filter(el => { return el.Location_Name == element.WPM_AreaName })[0]._doc : {},
                        WPM_AreaName: element.WPM_AreaName
                    })
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


                // if (filter.PeopleType.some(e => e.PeopleType === element.PeopleType) == false) {
                //     filter.PeopleType.push({
                //         ...(ScaffoldingType_master.filter(el => { return el.sObjectName == element.PeopleType })[0]) ?
                //             ScaffoldingType_master.filter(el => { return el.sObjectName == element.PeopleType })[0]._doc : {},
                //         PeopleType: element.PeopleType
                //     })
                // }



            }
        })


        if (still_or_out_check.length > 0) {
            filter.notification.push({ notification: 'still_or_out' })
        }

        if (sos_check.length > 0) {
            filter.notification.push({ notification: 'sos' })
        }

        if (no_work_check.length > 0) {
            filter.notification.push({ notification: 'no_work' })

        }


        var Notification_ = {}
        if (typeof Notification == 'string') {
            Notification = [Notification]
        }
        if (Notification.length > 0) {
            Notification_.$or = []
        }
        if (Notification.includes('still_or_out')) {
            Notification_.$or.push({ WarningStatusID: { $in: ['1'] } })
        }
        if (Notification.includes('sos')) {
            Notification_.$or.push({ WarningStatusID: { $in: ['2'] } })
        }
        if (Notification.includes('no_work')) {
            Notification_.$or.push({ WarningStatusID: { $in: ['3'] } })
        }

        await People.find({
            $and: [
                where_permission,
                PTTStaffID,
                AgencyName,
                WorkingStartDate,
                WorkingEndDate,
                AreaName,
                SubAreaName,
                WPM_AreaName,
                WPM_SubAreaName,
                CompanyName,
                PeopleType,
                Notification_
            ]
        }).then((result) => {
            for (let index = 0; index < result.length; index++) {

                var notification = {
                    still_or_out: false,
                    sos: false,
                    no_work: false

                }

                const element = result[index]._doc;
                element.notification = {}

                element.others.show_in_map = true
                element.others.on_table = true

                if (element.WarningStatusID) {
                    if (element.WarningStatusID.includes(1)) {

                        still_or_out = still_or_out + 1
                        notification.still_or_out = true


                    }
                    if (element.WarningStatusID.includes(2)) {
                        sos = sos + 1
                        notification.sos = true


                    }
                    if (element.WarningStatusID.includes(3)) {
                        no_work = no_work + 1
                        notification.no_work = true


                    }
                }


                if (still_or_out_check.length > 0) {
                    element.notification.still_or_out = notification.still_or_out

                }

                if (sos_check.length > 0) {
                    element.notification.sos = notification.sos

                }

                if (no_work_check.length > 0) {
                    element.notification.no_work = notification.no_work

                }


                all = all + 1
                delete element._id
                delete element.__v


                data_arr.push(element)

            }
        })


        await PeopleRestrict.find().then(el => {
            if (el.length > 0) {
                for (let index = 0; index < el.length; index++) {
                    const element = el[index]._doc;
                    element.others.show_in_map = true
                    element.others.on_table = false
                    data_arr.push(element)
                }
            }
        })


        var data = {}
        data.summary = {}
        data.filter = {}
        data.data = []

        if (over_all_check.length > 0) {

            data.summary = {
                all: all,
            }
            if (still_or_out_check.length > 0) {
                data.summary.still_or_out = still_or_out
            }

            if (sos_check.length > 0) {
                data.summary.sos = sos
            }

            if (no_work_check.length > 0) {
                data.summary.no_work = no_work
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
