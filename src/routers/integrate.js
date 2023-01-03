
import express from 'express';
import { scaffolding, people, vehicle, workpermit, equipment, accesscontrol } from '../handlers/integrate.js'
import { check_jwt } from '../preHandlers/jwt_auth.js'
import integrateSchema from '../models/Integrate/schema.integrate.js'
var integrateRouters = express.Router();

integrateRouters.get('/scaffolding', check_jwt, scaffolding)
integrateRouters.get('/people', check_jwt, people)
integrateRouters.get('/vehicle', check_jwt, vehicle)
integrateRouters.get('/equipment', check_jwt, equipment)
integrateRouters.get('/workpermit', check_jwt, workpermit)
integrateRouters.get('/accesscontrol', check_jwt, accesscontrol)

// integrateRouters.get('/dashboard', check_jwt, dashboard)


export { integrateRouters, integrateSchema }
