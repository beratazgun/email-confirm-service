import { Subscriber } from '@balearner/common'
import amqp from 'amqplib'
import EmailService from '../../services/email/EmailService'

interface ConfirmationEmailSubsInterface {
	firstName: string
	email: string
	token: string
	url: string
}

class ConfirmationEmailSubs extends Subscriber<ConfirmationEmailSubsInterface> {
	exchangeName = 'user-confirmation'
	routingKey = 'user-confirmation'
	queueName = 'user-confirmation'
	exchangeType = 'direct'

	constructor(public conn: amqp.Connection) {
		super(conn)
	}

	onMessage(msg: any) {
		console.log('message received')
		const { firstName, email, token, url } = msg

		new EmailService().sendEmail(
			email,
			'Confirm your email address',
			'confirmEmail',
			{
				firstName,
				email,
				token,
				url,
			}
		)

		console.log('Confirmation email sent to ' + email)
	}
}

export { ConfirmationEmailSubs }
