import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import transporter from '../config/nodemailer.js'
dotenv.config()

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body
        // console.log(req.body)
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please fill in all fields." })
        }
        const existingUser = await userModel.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use." })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new userModel({ name, email, password: hashedPassword })
        await user.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to our website',
            text: `Hello ${name}, welcome to our website.`
        }
        await transporter.sendMail(mailOptions)
        return res.status(201).json({ message: "User created successfully" })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: "Please fill in all fields." })
        }
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User doesn't exist." })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password"
            })
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(200).json({ message: "Logged in successfully" })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}

export const logOut = async (req, res) => {
    try {
        res.cookie('')
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}

export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body
        const otp = Math.floor(100000 + Math.random() * 900000)
        const user = await userModel.findOne(userId)
        if(user.isVerify){
            return res.status(400).json({message: "Email is already verified."})
        }

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Verify your account",
            text: `Your OTP is ${otp}`
        }
        await transporter.sendMail(mailOptions)
        user.verifyOtp = otp
        user.verifyOtpExpireAt = Date.now() + 300000
        await user.save()
        return res.status(200).json({ message: "OTP sent successfully" })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error
        })
    }
}

export const verifyEmail = async (req,res) => {
    try {
        const {userId,otp} = req.body
        const user = await userModel.findOne(userId)
        if(!user){
            return res.status(404).json({message: "User not found."})
        }
        if(user.verifyOtpExpireAt < Date.now()){
            return res.status(400).json({message: "OTP expired."})
        }
        if(user.verifyOtp !== otp || otp === ''){
            return res.status(400).json({message: "Invalid OTP."})
        }
        user.isVerify = true
        user.verifyOtp = ''
        user.verifyOtpExpireAt = 0
        await user.save()
        return res.status(200).json({message: "Email verified successfully."})
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error
        })
    }
}

export const sendResetOtp = async (req,res) => {
    try {
        const {email} = req.body
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(404).json({message: "User not found."})
        }
        const otp = Math.floor(100000 + Math.random() * 900000)
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Reset Password",
            text: `Your OTP is ${otp} `,
        }
        await transporter.sendMail(mailOptions)
        user.resetOtp = otp
        user.resetExpireOtp = Date.now() + 30000
        await user.save()
        return res.status(200).json({message: "OTP sent successfully."})
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error
        })
    }
}

export const resetPassword = async (req,res) => {
    try {
        const {otp,email} = req.body
        const user = await userModel.findOne({email})
        if (!user) {
            return res.status(400).json({ message: "User doesn't exist." })
        }
        if(user.resetExpireOtp < Date.now()){
            return res.status(400).json({ message: "OTP expired" })
        }
        if (user.resetOtp !== otp || otp === '') {
            return res.status(400).json({ message: "Invalid OTP" })
        }
        user.resetOtp = ''
        user.resetExpireOtp = 0
        await user.save()
        return res.status(200).json({ message: "OTP verified successfully" })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error
        })
    }
}

export const isAuthenticated = async (req,res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "User authenticated successfully",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error
        })
    }
}