
import express from 'express';
import { all, byid, add, edit, destroy } from '../handlers/workpermittype.js'
import { check_jwt } from '../preHandlers/jwt_auth.js'
import validateSchema from '../preHandlers/schema_validate.js';
import workpermitTypeSchema from '../models/Master/WorkpermitType/schema.workpermitType.js'

var workpermitTypeRouters = express.Router();

workpermitTypeRouters.get('/all',
    validateSchema(workpermitTypeSchema['/api/master/workpermittype/all'].get.parameters),
    check_jwt,
    all)
workpermitTypeRouters.get('/byid/:_id',
    validateSchema(workpermitTypeSchema['/api/master/workpermittype/byid/{_id}'].get.parameters),
    check_jwt,
    byid)
workpermitTypeRouters.post('/add',
    check_jwt,
    add)
workpermitTypeRouters.put('/put/:_id',
    validateSchema(workpermitTypeSchema['/api/master/workpermittype/put/{_id}'].put.parameters),
    check_jwt,
    edit
)
workpermitTypeRouters.delete('/delete/:_id',
    validateSchema(workpermitTypeSchema['/api/master/workpermittype/delete/{_id}'].delete.parameters),
    check_jwt,
    destroy
)
export { workpermitTypeRouters, workpermitTypeSchema }
