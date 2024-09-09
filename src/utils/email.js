import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    // define email options
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    };
    // actually send email
    await transporter.sendMail(mailOptions);
};

export default sendEmail;
