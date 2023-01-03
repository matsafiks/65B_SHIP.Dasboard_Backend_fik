
import express from 'express';
import { all, byid, add, edit, destroy } from '../handlers/scaffoldingtype.js'
import { check_jwt } from '../preHandlers/jwt_auth.js'
import validateSchema from '../preHandlers/schema_validate.js';
import scaffoldingTypeSchema from '../models/Master/ScaffoldingType/schema.scaffoldingType.js'

var scaffoldingTypeRouters = express.Router();

scaffoldingTypeRouters.get('/all',
    validateSchema(scaffoldingTypeSchema['/api/master/scaffoldingtype/all'].get.parameters),
    check_jwt,
    all)
scaffoldingTypeRouters.get('/byid/:_id',
    validateSchema(scaffoldingTypeSchema['/api/master/scaffoldingtype/byid/{_id}'].get.parameters),
    check_jwt,
    byid)
scaffoldingTypeRouters.post('/add',
    check_jwt,
    add)
scaffoldingTypeRouters.put('/put/:_id',
    validateSchema(scaffoldingTypeSchema['/api/master/scaffoldingtype/put/{_id}'].put.parameters),
    check_jwt,
    edit
)
scaffoldingTypeRouters.delete('/delete/:_id',
    validateSchema(scaffoldingTypeSchema['/api/master/scaffoldingtype/delete/{_id}'].delete.parameters),
    check_jwt,
    destroy
)
export { scaffoldingTypeRouters, scaffoldingTypeSchema }
