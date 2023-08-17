import dotenv from 'dotenv'
dotenv.config()
import path from 'path'
import bodyParser from 'body-parser'
import express, { Express } from 'express'
import cookieParser from 'cookie-parser'
import sessions from 'express-session'
import { redisConn } from './services/redis/redisConn'
import RedisStore from 'connect-redis'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import createHttpError from 'http-errors'
import amqp from 'amqplib'
import { ConfirmationEmailSubs } from './events/subscribers/subscribers'

import viewRoutes from './routes/view.routes'

const app: Express = express()

app.use(morgan('dev'))

app.use(bodyParser.json())
app.use(cookieParser())

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

app.use(
	cors({
		credentials: true, // This is important.
		origin: '*',
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	})
)

app.use(
	sessions({
		store: new RedisStore({
			client: redisConn,
			prefix: 'sesID#',
		}),
		name: 'sesID',
		secret: 'userssecret',
		cookie: {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24, // 24 hours
			secure: false,
		},
		resave: true,
		saveUninitialized: false,
	})
)

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 240, // Limit each IP to 120 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests
app.use(limiter)

app.use(
	helmet({
		xssFilter: true, // XSS attack
		frameguard: true, // Clickjacking
		hsts: true, // HTTP Strict Transport Security
		noSniff: true, // MIME sniffing
		hidePoweredBy: true, // Hide X-Powered-By
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // I know this is not safe, but I am using it for development purpose.
				styleSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // I know this is not safe, but I am using it for development purpose.
				connectSrc: ["'self'", 'http://localhost:3050', 'http://nginx:3050'],
			},
		},
	})
)

app.use('/', viewRoutes)

app.all('*', (req, res, next) => {
	next(new createHttpError.NotFound('This route is not defined.'))
})

amqp.connect('amqp://guest:guest@rabbitmq:5672').then((conn) => {
	new ConfirmationEmailSubs(conn).listen()
})

export { app }
