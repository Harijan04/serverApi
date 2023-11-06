import ErrorHandler from "../utils/error.js";
import jwt from "jsonwebtoken"
import { asyncError } from "./error.js";
import { User } from "../models/user.js";

export const isAuthenticated =asyncError(async (req,res,next)=>{
    const {token} = req.cookies;

    if(!token) return next(new ErrorHandler("User not logged in",401))
    const decodedData  =jwt.verify(token,process.env.JWT_TOKEN)
    req.user = await User.findById(decodedData._id)

    next()
})