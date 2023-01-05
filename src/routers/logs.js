
import express from 'express';
import { all } from '../handlers/logs.js'
import { check_jwt } from '../preHandlers/jwt_auth.js'
import validateSchema from '../preHandlers/schema_validate.js';
import logsSchema from '../models/Logs/schema.logs.js'

let logsRouters = express.Router();

logsRouters.get('/all',
    validateSchema(logsSchema['/api/admin/logs/all'].get.parameters),
    check_jwt,
    all)

export { logsRouters, logsSchema }
