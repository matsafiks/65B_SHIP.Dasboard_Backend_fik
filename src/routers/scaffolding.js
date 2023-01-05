
import express from 'express';
import { all } from '../handlers/scaffolding.js'
import { check_jwt } from '../preHandlers/jwt_auth.js'
import scaffoldingSchema from '../models/Scaffolding/schema.scaffolding.js'
let scaffoldingRouters = express.Router();

scaffoldingRouters.get('/all', check_jwt, all)

export { scaffoldingRouters, scaffoldingSchema }
