
import express from 'express';
import { all, vehicle2 } from '../handlers/vehicle.js'
import { check_jwt } from '../preHandlers/jwt_auth.js'
import vehicleSchema from '../models/Vehicle/schema.vehicle.js'
var vehicleRouters = express.Router();

vehicleRouters.get('/all', check_jwt, all)
vehicleRouters.get('/vehicle2', check_jwt, vehicle2)

export { vehicleRouters, vehicleSchema }
