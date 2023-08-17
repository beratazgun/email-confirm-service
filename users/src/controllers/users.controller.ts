import { PrismaClient } from '@prisma/client'
import { Request, Response, NextFunction } from 'express'
import AsyncCatchError from '../utils/AsyncCatchError'
import Tokens from 'csrf'
import createHttpError from 'http-errors'
import schemaValidate from '../utils/schemaValidate'
import { signupSchema } from '../validation/schemas'
import { redisConn } from '../services/redis/redisConn'
import { generateKeys } from '../services/redis/generateKeys'
import { generateHashedToken } from '../utils/generator'
import bcrypt from 'bcryptjs'
import rabbitmqConn from '../events/rabbitmqConn'
import { SendConfirmationEmail } from '../events/publishers/publishers'
import { app } from '../app'

import { authenticator } from 'otplib'

const prisma = new PrismaClient()

class UsersController {
	signup = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const validationErrors = schemaValidate(signupSchema, req.body)

			if (validationErrors) {
				return next(
					createHttpError(400, 'İnvalid inputs', {
						isSuccess: false,
						status: 'fail',
						validationErrors,
					})
				)
			} else {
				const { firstName, lastName, email, phone, password } = req.body

				const users = await prisma.users.create({
					data: {
						firstName: firstName.toLowerCase(),
						lastName: lastName.toLowerCase(),
						email: email.toLowerCase(),
						phone,
						password: await bcrypt.hash(password, 12),
					},
				})

				const token = generateHashedToken(32)
				await redisConn.set(
					generateKeys('emailConfirm', token),
					JSON.stringify({
						id: users.id,
						token,
					}),
					'EX',
					60 * 10
				)

				rabbitmqConn.then((conn) => {
					new SendConfirmationEmail(conn).publish({
						firstName: users.firstName,
						email: users.email,
						token,
						url: `${process.env.EMAIL_SERVICE_URL}/verify/confirm-account/${token}?userType=users`,
					})
				})

				res.status(201).json({
					status: 'success',
					isSuccess: true,
					statusCode: 201,
					message:
						'You have successfully signed up. Please confirm your email address.',
				})
			}
		}
	)

	signin = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { email, password } = req.body

			if (email === req.session?.user?.email) {
				return next(createHttpError.BadRequest('You are already logged in.'))
			}

			const users = await prisma.users.findUnique({
				where: {
					email: email.toLowerCase(),
				},
			})

			if (!users || !(await bcrypt.compare(password, users.password))) {
				return next(createHttpError.BadRequest('Invalid email or password.'))
			}

			if (!users.isAccountVerified) {
				return next(
					createHttpError.Unauthorized('Please confirm your email address.')
				)
			}

			if (users.isAccountDeleted) {
				return next(
					createHttpError.Unauthorized('Your account has been deleted.')
				)
			}

			if (users.isAccountBlocked) {
				return next(
					createHttpError.Unauthorized('Your account has been blocked.')
				)
			}

			req.session.user = users
			this.sendCSRFToken(req, res, next)

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				statusCode: 200,
				message: 'You have successfully signed in.',
			})
		}
	)

	sendCSRFToken = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const secret = new Tokens().secretSync()
			const token = new Tokens().create(secret)

			res.cookie('csrfToken', token, {
				httpOnly: true,
				sameSite: 'strict',
				maxAge: 1000 * 60 * 60 * 24,
			})

			req.session.csrfToken = token
		}
	)

	confirmAccount = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { token } = req.params

			const redisKey = generateKeys('emailConfirm', token)
			const redisValue = await redisConn.get(redisKey)
			const redisValueObj = JSON.parse(redisValue!)

			if (!redisValue || token !== redisValueObj.token) {
				return next(
					createHttpError.Unauthorized(
						'Your confirmation link has expired or invalid.'
					)
				)
			}

			console.log(redisValueObj)
			console.log(token)

			const isUserExist = await prisma.users.findUnique({
				where: {
					id: redisValueObj.id,
				},
			})

			if (!isUserExist) {
				return next(
					createHttpError.Unauthorized('User does not exist in our database.')
				)
			}

			await prisma.users.update({
				where: {
					id: redisValueObj.id,
				},
				data: {
					isAccountVerified: true,
				},
			})

			await redisConn.del(redisKey)

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				statusCode: 200,
				message: 'You have successfully confirmed your account.',
			})
		}
	)
}

export default UsersController
