import * as nodemailer from 'nodemailer'
import path from 'path'
import { capitalize } from 'lodash'
import ejs from 'ejs'
import fs from 'fs'

export default class EmailService {
	private transporter: nodemailer.Transporter

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.MAIL_HOST,
			port: process.env.MAIL_PORT as number | undefined,
			auth: {
				user: process.env.MAIL_USERNAME,
				pass: process.env.MAIL_PASSWORD,
			},
		})
	}

	async sendEmail(
		to: string,
		subject: string,
		template: string,
		data: any
	): Promise<void> {
		const html = await this.renderTemplate(template, data)
		await this.transporter.sendMail({
			from: process.env.MAIL_FROM,
			to,
			subject,
			html,
		})
	}

	private async renderTemplate(template: string, data: any): Promise<string> {
		console.log(
			'🚀 ~ file: EmailService.ts:37 ~ EmailService ~ renderTemplate ~ data:',
			data
		)
		const templateDir = path.join(
			__dirname,
			`../../views/templates/${template}.ejs`
		)

		const html = await fs.promises.readFile(templateDir, 'utf-8')

		return ejs.render(html, data)
	}
}
