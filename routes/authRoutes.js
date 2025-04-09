import express from "express"
import {register,logOut,login,sendVerifyOtp,sendResetOtp,verifyEmail,resetPassword,isAuthenticated} from '../controllers/authController.js'
import userAuth from "../middleware/userAuth.js"
const router = express.Router()

router.post('/register',register)
router.post('/login',login)
router.post('/logout',logOut)
router.post('/send-verify-opt',userAuth,sendVerifyOtp)
router.post('/send-reset-otp' , sendResetOtp)
router.post('/verify-account',userAuth,verifyEmail)
router.post('/reset-password' , resetPassword)
router.post('/is-auth',userAuth,isAuthenticated)

export default router