import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import authRoutes from './routes/authRoutes.js'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
connectDB()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials:true
}))

app.use('/api/auth',authRoutes)
app.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT}`)
})