
import express from 'express';
import { all } from '../handlers/workpermit.js'
import { check_jwt } from '../preHandlers/jwt_auth.js'
import workPermitSchema from '../models/WorkPermit/schema.workPermit.js'
var workPermitRouters = express.Router();

workPermitRouters.get('/all', check_jwt, all)

export { workPermitRouters, workPermitSchema }
