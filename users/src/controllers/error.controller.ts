import { Response, Request, NextFunction, response } from 'express'
import createHttpError from 'http-errors'
import { lowerCase, keys } from 'lodash'

export const ThrowGlobalError = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (err instanceof createHttpError.HttpError) {
		res.status(err.statusCode).json({
			status: 'fail',
			isSuccess: false,
			statusCode: err.statusCode,
			message: err.message,
			validationErrors: err.validationErrors,
		})
	} else if (err.code === 'P2002') {
		res.status(400).json({
			status: 'fail',
			isSuccess: false,
			statusCode: 400,
			message: `This ${err.meta.target} is already in use.`,
		})
	}

	console.log(err)
	next()
}
