import joi from 'joi'

interface İnputs {
	[key: string]: string
}

function schemaValidate(schema: joi.ObjectSchema<any>, inputs: İnputs) {
	const { error } = schema.validate(inputs, { abortEarly: false })
	let validationErrors: {
		[key: string]: string
	} = {}

	if (error) {
		error.details.forEach((el: any) => {
			validationErrors[el.context.key] = el.message
		})

		return validationErrors
	}
}
export default schemaValidate
