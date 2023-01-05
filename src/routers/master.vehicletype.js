
import express from 'express';
import { all, byid, add, edit, destroy } from '../handlers/vehicletype.js'
import { check_jwt } from '../preHandlers/jwt_auth.js'
import validateSchema from '../preHandlers/schema_validate.js';
import vehicleTypeSchema from '../models/Master/VehicleType/schema.vehicleType.js'

let vehicleTypeRouters = express.Router();

vehicleTypeRouters.get('/all',
    validateSchema(vehicleTypeSchema['/api/master/vehicletype/all'].get.parameters),
    check_jwt,
    all)
vehicleTypeRouters.get('/byid/:_id',
    validateSchema(vehicleTypeSchema['/api/master/vehicletype/byid/{_id}'].get.parameters),
    check_jwt,
    byid)
vehicleTypeRouters.post('/add',
    check_jwt,
    add)
vehicleTypeRouters.put('/put/:_id',
    validateSchema(vehicleTypeSchema['/api/master/vehicletype/put/{_id}'].put.parameters),
    check_jwt,
    edit
)
vehicleTypeRouters.delete('/delete/:_id',
    validateSchema(vehicleTypeSchema['/api/master/vehicletype/delete/{_id}'].delete.parameters),
    check_jwt,
    destroy
)
export { vehicleTypeRouters, vehicleTypeSchema }
