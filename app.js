import express from 'express'
import { config } from "dotenv"

import cookieParser from "cookie-parser"
import user from './routes/user.js'
import product from './routes/post.js'
import { errorMiddleware } from './middleware/error.js'
import group from './routes/group.js'
import chat from './routes/chat.js'
import cors from 'cors'

config({
    path:"./data/config.env",
})

export const app = express()

// Allow requests from any origin
app.use(cors({
    credentials: true, // This allows the server to set cookies on responses
    methods:["GET","POST","PUT","DELETE"],
    origin:"*"
}));
//Using middleware
app.use(express.json())
app.use(cookieParser())



app.get("/",(req,res,next)=>{
 res.send("Worddking")
})



///user Router
app.use("/api/v1",user)

//Post Router
app.use("/api/v1/",product)

//Group routes

app.use('/api/v1/',group)

app.use('/api/v1/',chat)



//Error middleware

app.use(errorMiddleware)
