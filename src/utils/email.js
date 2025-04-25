import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import nodemailer from 'nodemailer';
import { htmlToText } from 'html-to-text';
import { renderFile } from 'pug';
class Email {
	constructor(user, url) {
		this.to = user.email;
		this.firstname = user.name.split(' ')[0];
		this.url = url;
		this.from = process.env.EMAIL_FROM;
	}
	createEmailTransport() {
		const nodeEnv = process.env.NODE_ENV || 'dev';
		if (nodeEnv === 'prod') {
			return nodemailer.createTransport({
				host: process.env.EMAIL_HOST_PROD,
				port: process.env.EMAIL_PORT_PROD,
				auth: {
					user: process.env.EMAIL_USER_PROD,
					pass: process.env.EMAIL_PASS_PROD,
				},
			});
		}
		return nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});
	}
	async send(template, subject) {
		const templatePath = path.join(`${__dirname}`, `/../views/${template}.pug`);
		const html = renderFile(templatePath, {
			firstname: this.firstname,
			url: this.url,
			subject,
		});

		const mailOptions = {
			from: this.from,
			to: this.to,
			subject,
			html,
			text: htmlToText(html),
		};
		await this.createEmailTransport().sendMail(mailOptions);
	}

	async sendWelcome() {
		await this.send('emailWelcome', 'Welcome to the Natours Family');
	}
	async sendPasswordReset() {
		await this.send('emailPasswordReset', 'Password reset token, valid for 10 minutes');
	}
}
export default Email;
