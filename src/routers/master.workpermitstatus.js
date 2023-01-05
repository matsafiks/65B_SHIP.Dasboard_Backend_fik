
import express from 'express';
import { all, byid, add, edit, destroy } from '../handlers/workpermitstatus.js'
import { check_jwt } from '../preHandlers/jwt_auth.js'
import validateSchema from '../preHandlers/schema_validate.js';
import workpermitStatusSchema from '../models/Master/WorkpermitStatus/schema.workpermitStatus.js'

let workpermitStatusRouters = express.Router();

workpermitStatusRouters.get('/all',
    validateSchema(workpermitStatusSchema['/api/master/workpermitstatus/all'].get.parameters),
    check_jwt,
    all)
workpermitStatusRouters.get('/byid/:_id',
    validateSchema(workpermitStatusSchema['/api/master/workpermitstatus/byid/{_id}'].get.parameters),
    check_jwt,
    byid)
workpermitStatusRouters.post('/add',
    check_jwt,
    add)
workpermitStatusRouters.put('/put/:_id',
    validateSchema(workpermitStatusSchema['/api/master/workpermitstatus/put/{_id}'].put.parameters),
    check_jwt,
    edit
)
workpermitStatusRouters.delete('/delete/:_id',
    validateSchema(workpermitStatusSchema['/api/master/workpermitstatus/delete/{_id}'].delete.parameters),
    check_jwt,
    destroy
)
export { workpermitStatusRouters, workpermitStatusSchema }
