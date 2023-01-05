
import express from 'express';
import { all, byid, add, edit, destroy } from '../handlers/application.js'
import { check_jwt } from '../preHandlers/jwt_auth.js'
import validateSchema from '../preHandlers/schema_validate.js';
import applicationSchema from '../models/Application/schema.application.js'

let applicationRouters = express.Router();

applicationRouters.get('/all',
    validateSchema(applicationSchema['/api/admin/application/all'].get.parameters),
    check_jwt,
    all)
applicationRouters.get('/byid/:_id',
    validateSchema(applicationSchema['/api/admin/application/byid/{_id}'].get.parameters),
    check_jwt,
    byid)
applicationRouters.post('/add',
    check_jwt,
    add)
applicationRouters.put('/put/:_id',
    validateSchema(applicationSchema['/api/admin/application/put/{_id}'].put.parameters),
    check_jwt,
    edit
)
applicationRouters.delete('/delete/:_id',
    validateSchema(applicationSchema['/api/admin/application/delete/{_id}'].delete.parameters),
    check_jwt,
    destroy
)
export { applicationRouters, applicationSchema }
