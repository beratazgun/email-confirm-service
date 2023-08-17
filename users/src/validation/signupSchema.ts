import joi from 'joi'

const signupSchema = joi
	.object({
		firstName: joi.string().required().min(3).messages({
			'string.base': 'First name must be a string',
			'string.empty': 'First name is required',
			'any.required': 'First name is required',
			'string.min': 'First name must be at least 3 characters',
		}),
		lastName: joi.string().required().min(3).messages({
			'string.base': 'Last name must be a string',
			'string.empty': 'Last name is required',
			'any.required': 'Last name is required',
			'string.min': 'Last name must be at least 3 characters',
		}),
		email: joi.string().email().required().messages({
			'string.base': 'Email must be a string',
			'string.empty': 'Email is required',
			'any.required': 'Email is required',
			'string.email': 'Email must be a valid email',
		}),
		phone: joi.string().required().min(11).max(11).messages({
			'string.base': 'Phone must be a string',
			'string.empty': 'Phone is required',
			'any.required': 'Phone is required',
			'string.min': 'Phone must be at least 11 characters',
			'string.max': 'Phone must be at most 11 characters',
		}),
		password: joi.string().min(8).required().messages({
			'string.base': 'Password must be a string',
			'string.empty': 'Password is required',
			'any.required': 'Password is required',
			'string.min': 'Password must be at least 8 characters',
		}),
		passwordConfirmation: joi
			.string()
			.valid(joi.ref('password'))
			.required()
			.messages({
				'string.base': 'Password confirmation must be a string',
				'string.empty': 'Password confirmation is required',
				'any.required': 'Password confirmation is required',
				'any.only': 'Password confirmation must match password',
			}),
	})
	.unknown(false)
	.messages({
		'object.unknown': '{#key} is not allowed.',
	})

export { signupSchema }
