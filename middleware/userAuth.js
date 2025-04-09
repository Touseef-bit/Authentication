import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const userAuth = async (req, res, next) => {
    const { token } = req.cookies
    if (!token) { return res.status(401).json({ msg: "Please login first" }) }
    try {
        const tokenDecode = jwt.verify(token,process.env.JWT_SECRET)
        if(tokenDecode.id){
            req.body.userId = tokenDecode.id
        }else{
            return res.status(401).json({ msg: "Invalid token" })
        }
        next()
    } catch (error) {
        return res.status(500).json({
            success:false,
            msg: error,
        })
    }
}

export default userAuth;