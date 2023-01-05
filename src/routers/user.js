
import express from 'express';
import { all, byid, add, edit, destroy } from '../handlers/user.js'
import { check_jwt } from '../preHandlers/jwt_auth.js'
import validateSchema from '../preHandlers/schema_validate.js';
import userSchema from '../models/User/schema.user.js'

let userRouters = express.Router();

userRouters.get('/all',
    validateSchema(userSchema['/api/admin/user/all'].get.parameters),
    check_jwt,
    all)
userRouters.get('/byid/:_id',
    validateSchema(userSchema['/api/admin/user/byid/{_id}'].get.parameters),
    check_jwt,
    byid)
userRouters.post('/add',
    check_jwt,
    add)
userRouters.put('/put/:_id',
    validateSchema(userSchema['/api/admin/user/put/{_id}'].put.parameters),
    check_jwt,
    edit
)
userRouters.delete('/delete/:_id',
    validateSchema(userSchema['/api/admin/user/delete/{_id}'].delete.parameters),
    check_jwt,
    destroy
)
export { userRouters, userSchema }
