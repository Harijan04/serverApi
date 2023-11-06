
import DataUriParse from 'datauri/parser.js'
import path from 'path'
import nodemailer from 'nodemailer';
export const sendToken =(user,res,message,StatusCode)=>{
    
    const token =  user.generateAuthToken()

    res.status(StatusCode).cookie("token",token,{
    ...CookieOptions,
        
        expires:new Date(Date.now()+15*24*60*60*1000 )
    }).json({
        success :true ,
        message
      
    })
}

export const CookieOptions={
    secure:process.env.NODE_ENV=="development"?false:true,
        httpOnly:process.env.NODE_ENV=="development"?false:true,
        sameSite:process.env.NODE_ENV=="development"?false:"none",
}



export const MgetDataUris = (files) => {
    const parser = new DataUriParse();
    const dataUris = [];

    for (const file of files) {
        const extName = path.extname(file.originalname).toString();
        const dataUri = parser.format(extName, file.buffer);
        dataUris.push(dataUri);
    }

    return dataUris;
};

export const getDataUris = (file) => {
  const parse = new DataUriParse()
  const extName = path.extname(file.originalname).toString()
  return parse.format(extName,file.buffer)
  };


 export const sendVerificationEmail = async (userEmail, otp,user) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'notesharecommunity@gmail.com',
            pass: 'dzcn evbo vjip sosz',
        },
    });

    const mailOptions = {
        from: 'notesharecommunity@gmail.com',
        to: userEmail, // User's email address
        subject: 'OTP Verification',
        text: `${user} Your OTP for verification is: ${otp}`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email: ', error);
    }
};

// Usage:


 export const  generateUniqueToken=()=> {
    const tokenLength = 10; // Adjust the length as needed
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    for (let i = 0; i < tokenLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        token += characters.charAt(randomIndex);
    }

    return token;
}



