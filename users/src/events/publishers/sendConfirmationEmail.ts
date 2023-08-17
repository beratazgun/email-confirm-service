import { Publisher } from '@balearner/common'
import amqp from 'amqplib'

interface SendConfirmationEmailInterface {
	firstName: string
	email: string
	token: string
	url: string
}

class SendConfirmationEmail extends Publisher<SendConfirmationEmailInterface> {
	exchangeName = 'user-confirmation'
	routingKey = 'user-confirmation'
	queueName = 'user-confirmation'
	exchangeType = 'direct'

	constructor(public conn: amqp.Connection) {
		super(conn)
	}
}

export { SendConfirmationEmail }
