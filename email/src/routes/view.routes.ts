import { Router } from 'express'
import axios from 'axios'
import ViewController from '../controllers/view.controller'

const router = Router()
const viewController = new ViewController()

router.get('/verify/confirm-account/:token', viewController.verifyAccount)

router.get('/reset-password/:token', viewController.resetPassword)

export default router
