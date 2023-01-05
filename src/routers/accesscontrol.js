
import express from 'express';
import { all } from '../handlers/accesscontrol.js'
import { check_jwt } from '../preHandlers/jwt_auth.js'
import accessControlSchema from '../models/AccessControl/schema.accessControl.js'
let accessControlRouters = express.Router();

accessControlRouters.get('/all', check_jwt, all)

export { accessControlRouters, accessControlSchema }
