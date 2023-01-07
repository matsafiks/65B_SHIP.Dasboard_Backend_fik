
import express from 'express';
import { all, byid, add, edit, destroy } from '../handlers/group.js'
import { check_jwt } from '../preHandlers/jwt_auth.js'
import validateSchema from '../preHandlers/schema_validate.js';
import groupSchema from '../models/Group/schema.group.js'

let groupRouters = express.Router();

groupRouters.get('/all',
    validateSchema(groupSchema['/api/admin/group/all'].get.parameters),
    check_jwt,
    all)
groupRouters.get('/byid/:_id',
    validateSchema(groupSchema['/api/admin/group/byid/{_id}'].get.parameters),
    check_jwt,
    byid)
groupRouters.post('/add',
    check_jwt,
    add)
groupRouters.put('/put/:_id',
    // validateSchema(groupSchema['/api/admin/group/put/{_id}'].put.parameters),
    check_jwt,
    edit
)
groupRouters.delete('/delete/:_id',
    validateSchema(groupSchema['/api/admin/group/delete/{_id}'].delete.parameters),
    check_jwt,
    destroy
)
export { groupRouters, groupSchema }
