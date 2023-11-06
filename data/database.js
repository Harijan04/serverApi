import mongoose from "mongoose";


export const connectDB = async ()=>{
    try {
      const {connection}  = await mongoose.connect(process.env.MONGO_URL) 
      console.log(`Server connected to database ${connection.host}`)
    } catch (error) {
        console.log(`ERROr id ${error}`)
        process.exit(1) 
    }
}