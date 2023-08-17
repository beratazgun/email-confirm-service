import amqp from 'amqplib'

const rabbitmqConn = amqp.connect('amqp://guest:guest@rabbitmq:5672')

export default rabbitmqConn
