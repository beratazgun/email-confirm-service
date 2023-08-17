import { customAlphabet } from 'nanoid'
import crypto from 'crypto'

function nanoIdGenerator(regex: string, size: number) {
	const nanoid = customAlphabet(regex, size)
	return nanoid()
}

function generateHashedToken(charLength: number) {
	const token = crypto.randomBytes(charLength).toString('hex') // unencrypted token
	const hashedToken = crypto.createHash('sha256').update(token).digest('hex') // encrypted token

	return hashedToken
}

export { nanoIdGenerator, generateHashedToken }
