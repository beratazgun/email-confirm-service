import axios from 'axios'
import { AsyncCatchError } from '@balearner/common'
import { Request, Response, NextFunction } from 'express'
import ejs from 'ejs'
import fs from 'fs'
import path from 'path'

class ViewController {
	verifyAccount = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { userType } = req.query
			try {
				await axios.post(
					`${process.env.NGINX_SERVICE_DOCKER_URL}/api/v1/${userType}/verify/confirm-account/${req.params.token}`
				)
				ejs.renderFile(
					path.join(__dirname, '../views/templates/accountConfirmed.ejs'),
					{
						headerText: 'Account Confirmed',
						bodyText:
							'Your account has been successfully confirmed! You now have full access to our platform.',
					},
					(err, data) => {
						res.send(data)
					}
				)
			} catch (error: any) {
				ejs.renderFile(
					path.join(__dirname, '../views/templates/accountConfirmed.ejs'),
					{
						headerText: 'Something went wrong',
						bodyText: error.response.data.message,
					},
					(err, data) => {
						res.send(data)
					}
				)
			}
		}
	)

	resetPassword = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			ejs.renderFile(
				path.join(__dirname, '../views/templates/passwordReset.ejs'),

				(err, data) => {
					res.send(data)
				}
			)
		}
	)
}

export default ViewController
