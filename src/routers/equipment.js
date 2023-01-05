
import express from 'express';
import { all, risk } from '../handlers/equipment.js'
import { check_jwt } from '../preHandlers/jwt_auth.js'
import equipmentSchema from '../models/Equipment/schema.equipment.js'
let equipmentRouters = express.Router();
equipmentRouters.get('/all', check_jwt, all)
equipmentRouters.get('/risk', check_jwt, risk)

export { equipmentRouters, equipmentSchema }
