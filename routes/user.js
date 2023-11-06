import  express  from "express";
import {  LOgOut, Login,  deleteMyProfile,  followUser, forgotPassword, getMyProfile, getUserById, register, resetPassword, searchUsersByName, updatePassword, updatePic, updateProfile } from "../controller/user.js";
import { isAuthenticated } from "../middleware/auth.js";
import { singleUpload } from "../middleware/multer.js";


const route = express.Router()

route.get("/user",isAuthenticated,getMyProfile)
route.get("/user/search",isAuthenticated,searchUsersByName)
route.get("/user/:id",isAuthenticated,getUserById)
// route.post("/register",multipleUpload,register)
route.post("/register",singleUpload,register)
route.post("/login",Login)
route.get("/logout",LOgOut)
route.get("/follow/:id",isAuthenticated,followUser)
route.delete('/user/delete',isAuthenticated,deleteMyProfile)



//Update Routes

route.put("/updateProfile",isAuthenticated,updateProfile)
route.put("/updatePassword",isAuthenticated,updatePassword)
route.put("/updatePic",isAuthenticated,singleUpload,updatePic)


//Forgot Passwork
route.route('/forgotPassword').post(forgotPassword).put(resetPassword)






export default route