import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const transporter = nodemailer.createTransport({
    // service:"Gmail",
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS,
    }
})

export default transporter