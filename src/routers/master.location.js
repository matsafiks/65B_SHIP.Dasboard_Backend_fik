
import express from 'express';
import { all, byid, add, edit, destroy } from '../handlers/location.js'
import { check_jwt } from '../preHandlers/jwt_auth.js'
import validateSchema from '../preHandlers/schema_validate.js';
import locationSchema from '../models/Master/Location/schema.location.js'

var locationRouters = express.Router();

locationRouters.get('/all',
    validateSchema(locationSchema['/api/master/location/all'].get.parameters),
    check_jwt,
    all)
locationRouters.get('/byid/:_id',
    validateSchema(locationSchema['/api/master/location/byid/{_id}'].get.parameters),
    check_jwt,
    byid)
locationRouters.post('/add',
    check_jwt,
    add)
locationRouters.put('/put/:_id',
    validateSchema(locationSchema['/api/master/location/put/{_id}'].put.parameters),
    check_jwt,
    edit
)
locationRouters.delete('/delete/:_id',
    validateSchema(locationSchema['/api/master/location/delete/{_id}'].delete.parameters),
    check_jwt,
    destroy
)
export { locationRouters, locationSchema }
