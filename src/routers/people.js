
import express from 'express';
import { all } from '../handlers/people.js'
import { check_jwt } from '../preHandlers/jwt_auth.js'
import peopleSchema from '../models/People/schema.people.js'
var peopleRouters = express.Router();

peopleRouters.get('/all', check_jwt, all)

export { peopleRouters, peopleSchema }
