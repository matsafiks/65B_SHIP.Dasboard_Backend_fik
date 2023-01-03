
import express from 'express';
import { pttstaffcodeAll, subareaAll, wpmSubareaAll } from '../handlers/master.js'
import { check_jwt } from '../preHandlers/jwt_auth.js'
import schema from '../models/Master/schema.js'

var masterRouters = express.Router();

masterRouters.get('/pttstaffcode/all',
    check_jwt,
    pttstaffcodeAll)

masterRouters.get('/subarea/all',
    check_jwt,
    subareaAll)

masterRouters.get('/wpmsubarea/all',
    check_jwt,
    wpmSubareaAll)

export { masterRouters, schema }
