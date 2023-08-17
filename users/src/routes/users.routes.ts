import { Router } from 'express'
import UsersController from '../controllers/users.controller'
import { isLoggedIn, checkCSRFToken } from '@balearner/common'

const router = Router()
const usersController = new UsersController()

// this route is going to signup new user
router.post('/auth/signup', usersController.signup)

// this route is going to signin user
router.post('/auth/signin', usersController.signin)

// this route is going to confirm account by verifying token sent to user's email
router.post('/verify/confirm-account/:token', usersController.confirmAccount)

export default router
